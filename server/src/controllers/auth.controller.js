const db = require("../models");
const { User: _User } = db;
const {deleteImage} = require("../helper/imageUpload.helper");
const { generateOTP } = require("../utils/generateOTP");
const { responder } = require("../constant/response");
const sendOtpToEmail = require("../service/emailProvider");
const generateToken = require("../utils/generateToken");
const CustomErrorHandler = require("../utils/CustomError");
const bcrypt = require("bcrypt");
const URL = require("../constant/url");
const fs = require("fs");
const path = require("path");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Handle optional profile image
    const profileImagePath = req.file && req.file.filename
      ? `/uploads/${req.file.filename}`
      : `/uploads/user.png`;

    const existingUser = await _User.findOne({ where: { email } });

    if (existingUser) {
      if (req.file && req.file.filename) {
        deleteImage(req.file.filename);
      }
      return next(CustomErrorHandler.alreadyExist("User already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP(6);

    const newUser = await _User.create({
      name,
      email,
      password: hashedPassword,
      verification_otp: otp,
      is_verified: false,
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      profile_image: profileImagePath,
    });

    const { password: _, ...user } = newUser.dataValues;

    await sendOtpToEmail(email, otp);

    const token = generateToken({ id: newUser.id, email: newUser.email });
    res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    user.profile_image = `${URL.BASE}${user.profile_image}`;

    return res.status(201).json({
      message: "User created successfully. Check your email for OTP verification",
      user,
      token
    });

  } catch (err) {

    if (req.file && req.file.filename) {
      deleteImage(req.file.filename);
    }
    console.error("Error in signup:", err);
    return next(err);
  }
};



exports.verifyOtp = async (req, res, next) => {
  try {
    const { verification_otp } = req.body;

    const otp = await _User.findOne({ where: { verification_otp } });

    if (!otp) {
      return responder(res, 404, "Invalid otp");
    }

    if (otp.otp_expires_at < new Date()) {
      return responder(res, 400, "OTP has expired");
    }

    otp.is_verified = true;
    otp.verification_otp = null;
    otp.otp_expires_at = null;
    await otp.save();

    const data = {
      id: otp.id,
      name: otp.name,
      email: otp.email,
      is_verified: otp.is_verified,
    };

    return responder(res, 200, "User verified successfully", data);
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    return next(err);
  }
};

exports.login = async (req, res, next) => {

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return responder(res, 400, "Email and password are required");
    }

    const user = await _User.findOne({ where: { email } });

    if (!user) {
      return responder(res, 404, "User not found");
    }

    if (!user.is_verified) {
      return responder(res, 403, "User is not verified");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return responder(res, 401, "Invalid email and password");
    }

    const { password: _, ...userData } = user.dataValues;

    const token = generateToken({ id: user.id, email: user.email });
    res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    return responder(res, 200, "Login successful", { userData, token });
  } catch (err) {
    console.error("Error in login:", err);
    return next(err);
  }
};

exports.resendOtpOrForgotPassword = async (req, res, next) => {
  try {
    const { email, flag } = req.body;

    // Basic validation
    if (!email) return responder(res, 400, "Email is required");

    // Fetch user
    const user = await _User.findOne({ where: { email } });
    if (!user) return responder(res, 404, "User not found");

    // OTP generation logic
    const generateAndSendOtp = async (message) => {
      const otp = generateOTP(6);
      user.verification_otp = otp;
      user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes
      await user.save();
      await sendOtpToEmail(email, otp);
      return responder(res, 200, message);
    };

    // Handle different flags
    switch (flag) {
      case "forgot_password":
        return await generateAndSendOtp("OTP sent for password reset");

      case "resend_otp":
        if (user.is_verified) {
          return responder(res, 400, "User is already verified");
        }
        return await generateAndSendOtp("OTP resent successfully");

      default:
        return responder(res, 400, "Invalid flag provided");
    }
  } catch (err) {
    console.error("Error in handleOtpRequest:", err);
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { verification_otp, new_password } = req.body;

    if (!verification_otp || !new_password) {
      return responder(res, 400, "OTP and new password are required");
    }
    const user = await _User.findOne({ where: { verification_otp } });
    if (!user) {
      return responder(res, 404, "User not found");
    }
    if (user.otp_expires_at < new Date()) {
      return responder(res, 400, "OTP has expired");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    user.verification_otp = null;
    user.otp_expires_at = null;
    await user.save();

    const { password: _, ...userData } = user.dataValues;

    const token = generateToken({ id: user.id, email: user.email });

    res.cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    return responder(res, 200, "Password reset successfully", {
      userData,
      token,
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return responder(res, 200, "Logout successful");
  } catch (err) {
    console.error("Error in logout:", err);
    return next(err);
  }
};


exports.getUser = async (req, res, next) => {

  try {

    const userId = req.params.id;

    const user = await _User.findOne({
      where: { id: userId },
      attributes: ['id', 'name', 'email', 'profile_image'],
    });

   
    const imagePath = user.profile_image;
    const split = imagePath.split('/');
    const fileName = split[split.length - 1];
    console.log("fileName", fileName);
    
    const filePath = path.join(__dirname, '..', 'uploads', 'Profile-Pic');
    const files = fs.readdirSync(filePath);
    
    let fileExists = false;
    
    for (const file of files) {
      if (file === fileName) {
        fileExists = true;
        console.log("File exists");
        break;
      }
    }
    
    // Avoid double prepending if already full URL
    if (fileExists) {
      if (!imagePath.startsWith(URL.BASE)) {
        user.profile_image = `/uploads/${fileName}`;
      } else {
        user.profile_image = imagePath;
      }
    } else {
      user.profile_image = `/uploads/user.png`;
    }
    
    

    if (!user) {
      return next(CustomErrorHandler.notFound("User not found"));
    }

    let userData = user.toJSON();


    if (userData.profile_image) {
      userData.profile_image = `${URL.BASE}${userData.profile_image}`;
    }

    return responder(res, 200, "User fetched successfully", userData);

  } catch (err) {
    console.error("Error in getUser:", err);
    return next(err);
  }
};
