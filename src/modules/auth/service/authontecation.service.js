import Usermodel, { providerTypes, roletypes } from "../../../DB/models/User.model.js";
import * as dbservice from "../../../DB/dbservice.js"
import { asyncHandelr } from "../../../utlis/response/error.response.js";
import { comparehash, generatehash } from "../../../utlis/security/hash.security.js";
import { successresponse } from "../../../utlis/response/success.response.js";
import {  decodedToken,  generatetoken,  tokenTypes } from "../../../utlis/security/Token.security.js";
import { Emailevent } from "../../../utlis/events/email.emit.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import OtpModel from "../../../DB/models/otp.model.js";
import { nanoid, customAlphabet } from "nanoid";
import { vervicaionemailtemplet } from "../../../utlis/temblete/vervication.email.js";
import { sendemail } from "../../../utlis/email/sendemail.js";
import { RestaurantModel } from "../../../DB/models/RestaurantSchema.model.js";
import cloud from "../../../utlis/multer/cloudinary.js";
// import { sendOTP } from "./regestration.service.js";
import AppSettingsSchema from "../../../DB/models/AppSettingsSchema.js";
import { sendOTP } from "./regestration.service.js";
import { dliveryModel } from "../../../DB/models/dliveryorder.js";
import { KiloPriceModel } from "../../../DB/models/kiloPriceSchema.js";
const AUTHENTICA_OTP_URL = "https://api.authentica.sa/api/v1/send-otp";

import admin from 'firebase-admin';
// export const login = asyncHandelr(async (req, res, next) => {
//     const { identifier, password } = req.body; // identifier يمكن أن يكون إيميل أو رقم هاتف
//     console.log(identifier, password);

//     const checkUser = await Usermodel.findOne({
//         $or: [{ email: identifier }, { phone: identifier }]
//     });

//     if (!checkUser) {
//         return next(new Error("User not found", { cause: 404 }));
//     }

//     if (checkUser?.provider === providerTypes.google) {
//         return next(new Error("Invalid account", { cause: 404 }));
//     }

//     if (!checkUser.isConfirmed) {
//         return next(new Error("Please confirm your email tmm ", { cause: 404 }));
//     }

//     if (!comparehash({ planText: password, valuehash: checkUser.password })) {
//         return next(new Error("Password is incorrect", { cause: 404 }));
//     }

//     const access_Token = generatetoken({
//         payload: { id: checkUser._id },
//         // signature: checkUser.role === roletypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
//     });

//     const refreshToken = generatetoken({
//         payload: { id: checkUser._id },
//         // signature: checkUser.role === roletypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
//         expiresIn: "365d"
//     });

//     return successresponse(res, "Done", 200, { access_Token, refreshToken, checkUser });
// });








// export const login = asyncHandelr(async (req, res, next) => {
//     const { identifier, password } = req.body; // identifier ممكن يكون إيميل أو رقم هاتف
//     console.log(identifier, password);

//     const checkUser = await Usermodel.findOne({
//         $or: [{ email: identifier }, { phone: identifier }]
//     });

//     if (!checkUser) {
//         return next(new Error("User not found", { cause: 404 }));
//     }

//     if (checkUser?.provider === providerTypes.google) {
//         return next(new Error("Invalid account", { cause: 404 }));
//     }

//     // ✅ تحقق من حالة التأكيد
//     if (!checkUser.isConfirmed) {
//         try {
//             if (checkUser.phone) {
//                 // ✅ إرسال OTP للهاتف
//                 await sendOTP(checkUser.phone);
//                 console.log(`📩 OTP تم إرساله إلى الهاتف: ${checkUser.phone}`);
//             } else if (checkUser.email) {
//                 // ✅ إنشاء OTP جديد للبريد
//                 const otp = customAlphabet("0123456789", 6)();
//                 const html = vervicaionemailtemplet({ code: otp });

//                 const emailOTP = await generatehash({ planText: `${otp}` });
//                 const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

//                 await Usermodel.updateOne(
//                     { _id: checkUser._id },
//                     { emailOTP, otpExpiresAt, attemptCount: 0 }
//                 );

//                 await sendemail({
//                     to: checkUser.email,
//                     subject: "Confirm Email",
//                     text: "رمز التحقق الخاص بك",
//                     html,
//                 });

//                 console.log(`📩 OTP تم إرساله إلى البريد: ${checkUser.email}`);
//             }

//             return successresponse(
//                 res,
//                 "الحساب غير مفعل، تم إرسال رمز التحقق من جديد",
//                 200,
//                 { status: "notverified" }
//             );
//         } catch (error) {
//             console.error("❌ فشل في إرسال OTP أثناء تسجيل الدخول:", error.message);
//             return next(new Error("فشل في إرسال رمز التحقق", { cause: 500 }));
//         }
//     }

//     // ✅ التحقق من كلمة المرور
//     if (!comparehash({ planText: password, valuehash: checkUser.password })) {
//         return next(new Error("Password is incorrect", { cause: 404 }));
//     }

//     // ✅ إنشاء التوكنات
//     const access_Token = generatetoken({
//         payload: { id: checkUser._id },
//     });

//     const refreshToken = generatetoken({
//         payload: { id: checkUser._id },
//         expiresIn: "365d"
//     });

//     return successresponse(res, "Done", 200, { access_Token, refreshToken, checkUser });
// });





// export const login = asyncHandelr(async (req, res, next) => {
//     const { identifier, password } = req.body; // identifier ممكن يكون إيميل أو رقم هاتف
//     const { fedk, fedkdrivers } = req.query; // ✅ الحقلين الجدد من query
//     console.log(identifier, password);

//     // ✅ إعداد الفلتر الأساسي
//     let baseFilter = {
//         $or: [{ email: identifier }, { phone: identifier }]
//     };

//     // ✅ لو الحقل fedk موجود → نبحث عن User أو ServiceProvider (Host, Doctor)
//     if (fedk) {
//         baseFilter.$or = [
//             { email: identifier, accountType: "User" },
//             { phone: identifier, accountType: "User" },
//             { email: identifier, accountType: "ServiceProvider", serviceType: { $in: ["Host", "Doctor"] } },
//             { phone: identifier, accountType: "ServiceProvider", serviceType: { $in: ["Host", "Doctor"] } }
//         ];
//     }

//     // ✅ لو الحقل fedkdrivers موجود → نبحث عن ServiceProvider (Driver, Delivery)
//     if (fedkdrivers) {
//         baseFilter.$or = [
//             { email: identifier, accountType: "ServiceProvider", serviceType: { $in: ["Driver", "Delivery"] } },
//             { phone: identifier, accountType: "ServiceProvider", serviceType: { $in: ["Driver", "Delivery"] } }
//         ];
//     }

//     const checkUser = await Usermodel.findOne(baseFilter);

//     if (!checkUser) {
//         return next(new Error("User not found", { cause: 404 }));
//     }

//     if (checkUser?.provider === providerTypes.google) {
//         return next(new Error("Invalid account", { cause: 404 }));
//     }

//     // ✅ تحقق من حالة التأكيد
//     if (!checkUser.isConfirmed) {
//         try {
//             if (checkUser.phone) {
//                 // ✅ إرسال OTP للهاتف
//                 await sendOTP(checkUser.phone);
//                 console.log(`📩 OTP تم إرساله إلى الهاتف: ${checkUser.phone}`);
//             } else if (checkUser.email) {
//                 // ✅ إنشاء OTP جديد للبريد
//                 const otp = customAlphabet("0123456789", 6)();
//                 const html = vervicaionemailtemplet({ code: otp });

//                 const emailOTP = await generatehash({ planText: `${otp}` });
//                 const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

//                 await Usermodel.updateOne(
//                     { _id: checkUser._id },
//                     { emailOTP, otpExpiresAt, attemptCount: 0 }
//                 );

//                 await sendemail({
//                     to: checkUser.email,
//                     subject: "Confirm Email",
//                     text: "رمز التحقق الخاص بك",
//                     html,
//                 });

//                 console.log(`📩 OTP تم إرساله إلى البريد: ${checkUser.email}`);
//             }

//             return successresponse(
//                 res,
//                 "الحساب غير مفعل، تم إرسال رمز التحقق من جديد",
//                 200,
//                 { status: "notverified" }
//             );
//         } catch (error) {
//             console.error("❌ فشل في إرسال OTP أثناء تسجيل الدخول:", error.message);
//             return next(new Error("فشل في إرسال رمز التحقق", { cause: 500 }));
//         }
//     }

//     // ✅ التحقق من كلمة المرور
//     if (!comparehash({ planText: password, valuehash: checkUser.password })) {
//         return next(new Error("Password is incorrect", { cause: 404 }));
//     }

//     // ✅ إنشاء التوكنات
//     const access_Token = generatetoken({
//         payload: { id: checkUser._id },
//     });

//     const refreshToken = generatetoken({
//         payload: { id: checkUser._id },
//         expiresIn: "365d"
//     });

//     return successresponse(res, "Done", 200, { access_Token, refreshToken, checkUser });
// });






export const login = asyncHandelr(async (req, res, next) => {
    const { identifier, password } = req.body; // ✅ identifier = رقم الهاتف فقط
    console.log(identifier, password);

    // ✅ البحث عن المستخدم برقم الهاتف فقط
    const checkUser = await Usermodel.findOne({ phone: identifier });

    if (!checkUser) {
        return next(new Error("المستخدم غير موجود", { cause: 404 }));
    }

    // ✅ لو المستخدم staff أو manager → تسجيل مباشر بدون تحقق OTP أو شروط إضافية
    if (checkUser.accountType === "staff" || checkUser.accountType === "manager") {
        if (!comparehash({ planText: password, valuehash: checkUser.password })) {
            return next(new Error("كلمة المرور غير صحيحة", { cause: 404 }));
        }

        const access_Token = generatetoken({
            payload: { id: checkUser._id },
        });

        const refreshToken = generatetoken({
            payload: { id: checkUser._id },
            expiresIn: "365d"
        });

        return successresponse(res, "✅ تم تسجيل الدخول بنجاح", 200, {
            access_Token,
            refreshToken,
            checkUser
        });
    }

    // ✅ تحقق من حالة التأكيد
    if (!checkUser.isConfirmed) {
        try {
            await sendOTP(checkUser.phone);
            console.log(`📩 OTP تم إرساله إلى الهاتف: ${checkUser.phone}`);

            return successresponse(
                res,
                "الحساب غير مفعل، تم إرسال رمز التحقق من جديد",
                200,
                { status: "notverified" }
            );
        } catch (error) {
            console.error("❌ فشل في إرسال OTP أثناء تسجيل الدخول:", error.message);
            return next(new Error("فشل في إرسال رمز التحقق", { cause: 500 }));
        }
    }

    // ✅ التحقق من كلمة المرور
    if (!comparehash({ planText: password, valuehash: checkUser.password })) {
        return next(new Error("كلمة المرور غير صحيحة", { cause: 404 }));
    }

    // ✅ إنشاء التوكنات
    const access_Token = generatetoken({
        payload: { id: checkUser._id },
    });

    const refreshToken = generatetoken({
        payload: { id: checkUser._id },
        expiresIn: "365d"
    });

    return successresponse(res, "✅ تم تسجيل الدخول بنجاح", 200, {
        access_Token,
        refreshToken,
        checkUser
    });
});



// export const createOrderClient = asyncHandelr(async (req, res, next) => {
//     const userId = req.user.id;
//     const {
//         customerName,
//         phone,
//         sourceAddress,
//         sourceLongitude,
//         sourceLatitude,
//         destinationAddress,
//         destinationLongitude,
//         destinationLatitude,
//         orderPrice,
//         deliveryPrice,
//         // bonus = 0,
//         totalPrice,
//         orderDetails = ""
//     } = req.body;

//     // ✅ التحقق من الحقول المطلوبة
//     // if (
//     //     !customerName || !phone ||
//     //     !sourceAddress || sourceLongitude === undefined || sourceLatitude === undefined ||
//     //     !destinationAddress || destinationLongitude === undefined || destinationLatitude === undefined ||
//     //     orderPrice === undefined || deliveryPrice === undefined || totalPrice === undefined
//     // ) {
//     //     return next(new Error("❌ جميع الحقول المطلوبة يجب إدخالها في body", { cause: 400 }));
//     // }

//     // ✅ التحقق من وجود المستخدم
//     const user = await Usermodel.findById(userId);
//     if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

//     // ✅ رفع صورة الطلب (إن وُجدت)
//     let uploadedImage = null;
//     if (req.files?.image?.[0]) {
//         const file = req.files.image[0];
//         const uploaded = await cloud.uploader.upload(file.path, { folder: "orders/images" });
//         uploadedImage = {
//             secure_url: uploaded.secure_url,
//             public_id: uploaded.public_id
//         };
//     }

//     // ✅ إنشاء الطلب
//     const newOrder = await dliveryModel.create({
//         customerName,
//         phone,
//         source: {
//             address: sourceAddress,
//             location: {
//                 type: "Point",
//                 coordinates: [parseFloat(sourceLongitude), parseFloat(sourceLatitude)]
//             }
//         },
//         destination: {
//             address: destinationAddress,
//             location: {
//                 type: "Point",
//                 coordinates: [parseFloat(destinationLongitude), parseFloat(destinationLatitude)]
//             }
//         },
//         orderPrice: parseFloat(orderPrice),
//         deliveryPrice: parseFloat(deliveryPrice),
//         // bonus: parseFloat(bonus),
//         totalPrice: parseFloat(totalPrice),
//         orderDetails: orderDetails.toString(),
//         image: uploadedImage,
//         createdBy: userId
//     });

//     return res.status(201).json({
//         success: true,
//         message: "✅ تم إنشاء الطلب بنجاح",
//         data: newOrder
//     });
// });




// export const createOrderClient = asyncHandelr(async (req, res, next) => {
//     const userId = req.user.id;
//     const {
//         customerName,
//         phone,
//         sourceAddress,
//         sourceLongitude,
//         sourceLatitude,
//         destinationAddress,
//         destinationLongitude,
//         destinationLatitude,
//         orderPrice,
//         deliveryPrice,
//         totalPrice,
//         orderDetails = ""
//     } = req.body;

//     // ✅ التحقق من وجود المستخدم
//     const user = await Usermodel.findById(userId);
//     if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

//     // ✅ تجهيز الأرقام لو موجودة فقط
//     const _orderPrice = orderPrice ? parseFloat(orderPrice) : undefined;
//     const _deliveryPrice = deliveryPrice ? parseFloat(deliveryPrice) : undefined;
//     const _totalPrice = totalPrice ? parseFloat(totalPrice) : undefined;

//     // ❗ لو القيمة موجودة لكن مش رقم → رجّع Error منطقي
//     if (orderPrice && isNaN(_orderPrice)) {
//         return next(new Error("⚠️ orderPrice يجب أن يكون رقم", { cause: 400 }));
//     }

//     if (deliveryPrice && isNaN(_deliveryPrice)) {
//         return next(new Error("⚠️ deliveryPrice يجب أن يكون رقم", { cause: 400 }));
//     }

//     if (totalPrice && isNaN(_totalPrice)) {
//         return next(new Error("⚠️ totalPrice يجب أن يكون رقم", { cause: 400 }));
//     }

//     // ✅ رفع صورة الطلب (إن وجدت)
//     let uploadedImage = null;
//     if (req.files?.image?.[0]) {
//         const file = req.files.image[0];
//         const uploaded = await cloud.uploader.upload(file.path, { folder: "orders/images" });
//         uploadedImage = {
//             secure_url: uploaded.secure_url,
//             public_id: uploaded.public_id
//         };
//     }

//     // ✅ إنشاء الطلب
//     const newOrder = await dliveryModel.create({
//         customerName,
//         phone,
//         source: {
//             address: sourceAddress,
//             location: {
//                 type: "Point",
//                 coordinates: [
//                     parseFloat(sourceLongitude),
//                     parseFloat(sourceLatitude)
//                 ]
//             }
//         },
//         destination: {
//             address: destinationAddress,
//             location: {
//                 type: "Point",
//                 coordinates: [
//                     parseFloat(destinationLongitude),
//                     parseFloat(destinationLatitude)
//                 ]
//             }
//         },
//         orderPrice: _orderPrice,
//         deliveryPrice: _deliveryPrice,
//         totalPrice: _totalPrice,
//         orderDetails: orderDetails.toString(),
//         image: uploadedImage,
//         createdBy: userId
//     });

//     return res.status(201).json({
//         success: true,
//         message: "✅ تم إنشاء الطلب بنجاح",
//         data: newOrder
//     });
// });





export const createOrderClient = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id;
    const {
        customerName,
        phone,
        sourceAddress,
        sourceLongitude,
        sourceLatitude,
        destinationAddress,
        destinationLongitude,
        destinationLatitude,
        orderPrice,
        toTime,
        fromTime,
        deliveryPrice,
        totalPrice, // <<< هيفضل موجود بس هنحسب الديناميكي ونستخدمه
        orderDetails = ""
    } = req.body;

    const user = await Usermodel.findById(userId);
    if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    const _orderPrice = orderPrice ? parseFloat(orderPrice) : undefined;
    const _deliveryPrice = deliveryPrice ? parseFloat(deliveryPrice) : undefined;
    let _totalPrice = totalPrice ? parseFloat(totalPrice) : undefined;

    if (orderPrice && isNaN(_orderPrice)) {
        return next(new Error("⚠️ orderPrice يجب أن يكون رقم", { cause: 400 }));
    }
    if (deliveryPrice && isNaN(_deliveryPrice)) {
        return next(new Error("⚠️ deliveryPrice يجب أن يكون رقم", { cause: 400 }));
    }
    if (totalPrice && isNaN(_totalPrice)) {
        return next(new Error("⚠️ totalPrice يجب أن يكون رقم", { cause: 400 }));
    }

    // 🔥🔥 حساب totalPrice ديناميكياً
    if (_orderPrice !== undefined && _deliveryPrice !== undefined) {
        _totalPrice = _orderPrice + _deliveryPrice;
    }

    let uploadedImage = null;
    if (req.files?.image?.[0]) {
        const file = req.files.image[0];
        const uploaded = await cloud.uploader.upload(file.path, { folder: "orders/images" });
        uploadedImage = {
            secure_url: uploaded.secure_url,
            public_id: uploaded.public_id
        };
    }

    // 🔥 إنشاء الطلب
    const newOrder = await dliveryModel.create({
        customerName,
        status: "pending",       // الطلب لسه جديد
        subStatus: "waiting",
        phone,
        toTime,
        fromTime,
        source: {
            address: sourceAddress,
            location: {
                type: "Point",
                coordinates: [
                    parseFloat(sourceLongitude),
                    parseFloat(sourceLatitude)
                ]
            }
        },
        destination: {
            address: destinationAddress,
            location: {
                type: "Point",
                coordinates: [
                    parseFloat(destinationLongitude),
                    parseFloat(destinationLatitude)
                ]
            }
        },
        orderPrice: _orderPrice,
        deliveryPrice: _deliveryPrice,
        totalPrice: _totalPrice, // 👈 تخزين السعر الديناميكي هنا
        orderDetails: orderDetails.toString(),
        image: uploadedImage,
        createdBy: userId
    });

    // 🔥🔥 إضافة الإشعارات هنا (نفس الموجود في createOrder بالظبط)
    const serviceProviders = await Usermodel.find({ accountType: "ServiceProvider" }, "fcmToken fullName");
    console.log("ServiceProviders found:", serviceProviders.length);

    for (const provider of serviceProviders) {
        const token = provider.fcmToken?.trim();
        const displayName = provider.fullName || provider._id.toString();

        if (!token) {
            console.log(`⚠️ تجاهل ${displayName} لتوكن فارغ`);
            continue;
        }

        console.log(`🔔 إرسال إشعار لـ ${displayName} مع توكن: ${token}`);

        try {
            await admin.messaging().send({
                notification: { title: "🚀 طلب جديد", body: `تم إنشاء طلب جديد من العميل: ${customerName}` },
                data: { orderId: newOrder._id.toString(), createdAt: newOrder.createdAt.toISOString(), type: "NEW_ORDER" },
                token: token
            });
            console.log(`✅ تم إرسال الإشعار لـ ${displayName}`);
        } catch (err) {
            console.error(`❌ فشل إرسال الإشعار للمستخدم ${displayName}:`, err.message);
        }
    }

    return res.status(201).json({
        success: true,
        message: "✅ تم إنشاء الطلب بنجاح",
        data: newOrder
    });
});

    

















// import Stripe from "stripe";
// import { Payment } from "../../../DB/models/paymentSchema.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET);

// export const createPaymentIntent = async (req, res) => {
//     try {
//         const { productId, amount, currency } = req.body;

//         if (!amount || !productId) {
//             return res.status(400).json({ message: "amount و productId مطلوبين" });
//         }

//         // إنشاء PaymentIntent في Stripe
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount * 100,
//             currency: currency || "usd",
//             metadata: {
//                 productId,
//                 userId: req.user._id.toString(),
//             },
//         });

//         // حفظ العملية في قاعدة البيانات
//         await Payment.create({
//             userId: req.user._id, // استخراج الـ _id من التوكن
//             productId,
//             amount,
//             currency: currency || "usd",
//             status: "pending",
//             stripePaymentIntentId: paymentIntent.id
//         });

//         res.json({
//             clientSecret: paymentIntent.client_secret
//         });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };






// export const stripeWebhook = async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET
//         );
//     } catch (err) {
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//         const paymentIntent = event.data.object;

//         // تحديث حالة الدفع في قاعدة البيانات
//         await Payment.findOneAndUpdate(
//             { stripePaymentIntentId: paymentIntent.id },
//             { status: "succeeded" }
//         );

//         console.log("✔ تم الدفع بنجاح", {
//             productId: paymentIntent.metadata.productId,
//             userId: paymentIntent.metadata.userId,
//             amount: paymentIntent.amount / 100
//         });
//     }

//     res.json({ received: true });
//  };


// ============================================
// 💳 Stripe Payment Controller
// مع استبدال productId بـ tripPriceId
// + إضافة تعليقات عربية توضيحية
// ============================================

import Stripe from "stripe";
import { Payment } from "../../../DB/models/paymentSchema.js";
import { FavoritePlace } from "../../../DB/models/FavoritePlace.js";
import { NotificationModell } from "../../../DB/models/notificationSchema.js";
import { Complaint } from "../../../DB/models/complaintSchema.js";
import { Withdraw } from "../../../DB/models/withdrawSchema.js";
import { ComplaintModell } from "../../../DB/models/complaintSchemaaaaa.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

// ============================================
// 1️⃣ إنشاء Payment Intent
// يتم استدعاؤه من تطبيق Flutter لبدء عملية الدفع
// ============================================
// export const createPaymentIntent = async (req, res) => {
//     try {
//         const { tripPriceId, amount, currency } = req.body;

//         // 🛑 التحقق من المدخلات
//         if (!amount || !tripPriceId) {
//             return res.status(400).json({
//                 message: "amount و tripPriceId مطلوبين"
//             });
//         }

//         if (amount <= 0) {
//             return res.status(400).json({
//                 message: "المبلغ يجب أن يكون أكبر من صفر"
//             });
//         }

//         if (!req.user?._id) {
//             return res.status(401).json({
//                 message: "غير مصرح - يجب تسجيل الدخول"
//             });
//         }

//         // ⚡ إنشاء Payment Intent على Stripe
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100), // التحويل إلى أصغر وحدة (سنت)
//             currency: currency || "usd",
//             metadata: {
//                 tripPriceId,
//                 userId: req.user._id.toString(),
//             },
//             automatic_payment_methods: { enabled: true },
//         });

//         // 💾 تخزين عملية الدفع في قاعدة البيانات
//         const payment = await Payment.create({
//             userId: req.user._id,
//             tripPriceId,
//             amount,
//             currency: currency || "usd",
//             status: "pending",
//             stripePaymentIntentId: paymentIntent.id,
//             createdAt: new Date()
//         });

//         // 🔁 إعادة clientSecret لتطبيق Flutter
//         res.status(200).json({
//             success: true,
//             clientSecret: paymentIntent.client_secret,
//             paymentIntentId: paymentIntent.id,
//             paymentId: payment._id,
//             amount,
//             currency: currency || "usd"
//         });

//     } catch (err) {
//         console.error("❌ Create Payment Intent Error:", err);
//         res.status(500).json({
//             success: false,
//             error: "فشل إنشاء عملية الدفع",
//             details: process.env.NODE_ENV === 'development' ? err.message : undefined
//         });
//     }
// };




export const createPaymentIntent = async (req, res) => {
    try {
        const { tripPriceId, amount, currency } = req.body;

        // 🛑 التحقق من المدخلات
        if (!amount || !tripPriceId) {
            return res.status(400).json({
                message: "amount و tripPriceId مطلوبين"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "المبلغ يجب أن يكون أكبر من صفر"
            });
        }

        if (!req.user?._id) {
            return res.status(401).json({
                message: "غير مصرح - يجب تسجيل الدخول"
            });
        }

        // 🆕 1) جلب الطلب من قاعدة البيانات
        const order = await dliveryModel.findById(tripPriceId);   // NEW
        if (!order) {
            return res.status(404).json({ message: "الطلب غير موجود" });
        }

        // 🆕 2) حساب الفرق بين deliveryPrice والمبلغ المدفوع
        const paidDeliveryAmount = Math.min(amount, order.deliveryPrice);

        // الفرق بين المبلغ اللي دفعه العميل وسعر الدليفري
        const deliveryRemaining = amount - paidDeliveryAmount;                      // NEW

        // ⚡ إنشاء Payment Intent على Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // التحويل إلى أصغر وحدة (سنت)
            currency: currency || "usd",
            metadata: {
                tripPriceId,
                userId: req.user._id.toString(),
            },
            automatic_payment_methods: { enabled: true },
        });

        // 💾 تخزين عملية الدفع في قاعدة البيانات
        const payment = await Payment.create({
            userId: req.user._id,
            tripPriceId,
            amount,
            currency: currency || "usd",
            status: "pending",
            stripePaymentIntentId: paymentIntent.id,
            createdAt: new Date(),

            // 🆕 الحقول الجديدة
            deliveryRemaining,      // NEW
            paidDeliveryAmount      // NEW
        });

        // 🔁 إعادة clientSecret لتطبيق Flutter
        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            paymentId: payment._id,
            amount,
            currency: currency || "usd",

            // 🆕 للإظهار فقط
            deliveryRemaining,
            paidDeliveryAmount
        });

    } catch (err) {
        console.error("❌ Create Payment Intent Error:", err);
        res.status(500).json({
            success: false,
            error: "فشل إنشاء عملية الدفع",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};








// ============================================
// 3️⃣ Webhook من Stripe
// يتم استدعاؤه تلقائياً عند حدوث أي تغيير في الدفع
// ============================================
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // 🛡️ التحقق من صحة التوقيع
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                const succeededIntent = event.data.object;

                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: succeededIntent.id },
                    {
                        status: "succeeded",
                        paidAt: new Date()
                    }
                );

                console.log("✅ Webhook: Payment succeeded", {
                    id: succeededIntent.id,
                    tripPriceId: succeededIntent.metadata.tripPriceId,
                    userId: succeededIntent.metadata.userId,
                    amount: succeededIntent.amount / 100
                });

                break;

            case "payment_intent.payment_failed":
                const failedIntent = event.data.object;

                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: failedIntent.id },
                    {
                        status: "failed",
                        failureReason: failedIntent.last_payment_error?.message
                    }
                );

                console.log("❌ Webhook: Payment failed");

                break;

            case "payment_intent.canceled":
                const canceledIntent = event.data.object;

                await Payment.findOneAndUpdate(
                    { stripePaymentIntentId: canceledIntent.id },
                    { status: "canceled" }
                );

                console.log("⚠️ Webhook: Payment canceled");
                break;
        }
    } catch (dbError) {
        console.error("❌ Webhook database error:", dbError);
    }

    res.status(200).json({ received: true });
};




// ============================================
// 2️⃣ التحقق من حالة الدفع
// يتم استدعاؤه بعد نجاح الدفع من Flutter
// ============================================
// export const verifyPayment = async (req, res) => {
//     try {
//         const { paymentIntentId } = req.body;

//         if (!paymentIntentId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "paymentIntentId مطلوب"
//             });
//         }

//         // 🔍 البحث عن عملية دفع في قاعدة البيانات
//         const payment = await Payment.findOne({
//             stripePaymentIntentId: paymentIntentId,
//             userId: req.user._id
//         });

//         if (!payment) {
//             return res.status(404).json({
//                 success: false,
//                 message: "عملية الدفع غير موجودة أو غير مصرح بها"
//             });
//         }

//         // 📡 الحصول على الحالة الفعلية من Stripe
//         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//         // 🟢 تحديث الحالة في قاعدة البيانات
//         if (paymentIntent.status === 'succeeded' && payment.status !== 'succeeded') {
//             payment.status = 'succeeded';
//             payment.paidAt = new Date();
//             await payment.save();
//         } else if (paymentIntent.status === 'canceled') {
//             payment.status = 'canceled';
//             await payment.save();
//         } else if (paymentIntent.status === 'requires_payment_method') {
//             payment.status = 'failed';
//             await payment.save();
//         }

//         // 🔁 إرسال الحالة إلى Flutter
//         res.status(200).json({
//             success: paymentIntent.status === 'succeeded',
//             status: paymentIntent.status,
//             dbStatus: payment.status,
//             amount: payment.amount,
//             currency: payment.currency,
//             tripPriceId: payment.tripPriceId,
//             paidAt: payment.paidAt,
//             message: paymentIntent.status === 'succeeded'
//                 ? "تم الدفع بنجاح"
//                 : "الدفع غير مكتمل"
//         });

//     } catch (err) {
//         console.error("❌ Verify Payment Error:", err);
//         res.status(500).json({
//             success: false,
//             error: "فشل التحقق من حالة الدفع"
//         });
//     }
// };


export const verifyPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: "paymentIntentId مطلوب"
            });
        }

        // 🔍 البحث عن عملية دفع في قاعدة البيانات
        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntentId,
            userId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "عملية الدفع غير موجودة أو غير مصرح  "
            });
        }

        // 📡 الحصول على الحالة الفعلية من Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // 🟢 تحديث الحالة في قاعدة البيانات
        if (paymentIntent.status === 'succeeded' && payment.status !== 'succeeded') {
            payment.status = 'succeeded';
            payment.paidAt = new Date();
            await payment.save();

            // ---------------------------------------------------
            // 🟢 تحديث الطلب ليصبح active + preparing بعد الدفع
            // ---------------------------------------------------
            await dliveryModel.findByIdAndUpdate(
                payment.tripPriceId,
                {
                    status: "active",
                    subStatus: "preparing"
                }
            );
            // ---------------------------------------------------

        } else if (paymentIntent.status === 'canceled') {
            payment.status = 'canceled';
            await payment.save();
        } else if (paymentIntent.status === 'requires_payment_method') {
            payment.status = 'failed';
            await payment.save();
        }

        // 🔁 إرسال الحالة إلى Flutter
        res.status(200).json({
            success: paymentIntent.status === 'succeeded',
            status: paymentIntent.status,
            dbStatus: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            tripPriceId: payment.tripPriceId,
            paidAt: payment.paidAt,
            message: paymentIntent.status === 'succeeded'
                ? "تم الدفع بنجاح"
                : "الدفع غير مكتمل"
        });

    } catch (err) {
        console.error("❌ Verify Payment Error:", err);
        res.status(500).json({
            success: false,
            error: "فشل التحقق من حالة الدفع"
        });
    }
};




// ============================================
// 4️⃣ جلب سجل المدفوعات
// ============================================
export const getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const payments = await Payment.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const count = await Payment.countDocuments({ userId: req.user._id });

        res.status(200).json({
            success: true,
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalPayments: count
        });

    } catch (err) {
        console.error("❌ Get Payment History Error:", err);
        res.status(500).json({
            success: false,
            error: "فشل جلب سجل المدفوعات"
        });
    }
};

// ============================================
// 5️⃣ استرجاع المبلغ Refund
// ============================================
export const refundPayment = async (req, res) => {
    try {
        const { paymentIntentId, reason } = req.body;

        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntentId,
            userId: req.user._id,
            status: 'succeeded'
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "عملية الدفع غير موجودة أو لا يمكن استرجاعها"
            });
        }

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: reason || 'requested_by_customer'
        });

        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();

        res.status(200).json({
            success: true,
            message: "تم استرجاع المبلغ بنجاح",
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });

    } catch (err) {
        console.error("❌ Refund Error:", err);
        res.status(500).json({
            success: false,
            error: "فشل استرجاع المبلغ"
        });
    }
};



export const getDriverPaymentsSummary = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: "غير مصرح - يجب تسجيل الدخول" });
        }

        const driverId = req.user._id;

        // 1) الطلبات المكتملة اللي تخص المندوب
        const completedOrders = await dliveryModel.find({
            assignedTo: driverId,
            status: "completed"
        }).populate("createdBy", "fullName phone profileImage"); // ← بيانات صاحب الطلب

        if (!completedOrders.length) {
            return res.status(200).json({
                success: true,
                totalAmount: 0,
                totalDeliveryRemaining: 0,
                totalPaidDeliveryAmount: 0,
                payments: []
            });
        }

        const orderIds = completedOrders.map(o => o._id.toString());

        // 2) كل المدفوعات المكتملة
        const succeededPayments = await Payment.find({
            tripPriceId: { $in: orderIds },
            status: "succeeded"
        });

        // 3) حساب المجاميع
        const totalAmount = succeededPayments.reduce((a, p) => a + p.amount, 0);
        const totalDeliveryRemaining = succeededPayments.reduce((a, p) => a + p.deliveryRemaining, 0);
        const totalPaidDeliveryAmount = succeededPayments.reduce((a, p) => a + p.paidDeliveryAmount, 0);

        // 4) دمج بيانات الطلب + بيانات صاحب الطلب
        const finalPayments = succeededPayments.map(payment => {
            const order = completedOrders.find(
                o => o._id.toString() === payment.tripPriceId.toString()
            );

            return {
                payment,  // بيانات الدفع نفسها
                order,    // بيانات الطلب كاملة بدون أي نقصان
                customer: order?.createdBy
                    ? {
                        id: order.createdBy._id,
                        name: order.createdBy.fullName,
                        phone: order.createdBy.phone,
                        profileImage: order.createdBy.profileImage || null
                    }
                    : null
            };
        });

        return res.status(200).json({
            success: true,
            totalAmount,
            totalDeliveryRemaining,
            totalPaidDeliveryAmount,
            payments: finalPayments
        });

    } catch (error) {
        console.error("❌ Error fetching payment summary:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب البيانات",
            error: error.message
        });
    }
};











export const getDriverPaymentsSummaryADMIN = async (req, res) => {
    try {

        // استخدام ID من الـ params بدلاً من التوكن
        if (!req.params?.id) {
            return res.status(400).json({ message: "يجب إرسال ID المندوب" });
        }

        const driverId = req.params.id;

        // 1) الطلبات المكتملة اللي تخص المندوب
        const completedOrders = await dliveryModel.find({
            assignedTo: driverId,
            status: "completed"
        }).populate("createdBy", "fullName phone profileImage"); // ← بيانات صاحب الطلب

        if (!completedOrders.length) {
            return res.status(200).json({
                success: true,
                totalAmount: 0,
                totalDeliveryRemaining: 0,
                totalPaidDeliveryAmount: 0,
                payments: []
            });
        }

        const orderIds = completedOrders.map(o => o._id.toString());

        // 2) كل المدفوعات المكتملة
        const succeededPayments = await Payment.find({
            tripPriceId: { $in: orderIds },
            status: "succeeded"
        });

        // 3) حساب المجاميع
        const totalAmount = succeededPayments.reduce((a, p) => a + p.amount, 0);
        const totalDeliveryRemaining = succeededPayments.reduce((a, p) => a + p.deliveryRemaining, 0);
        const totalPaidDeliveryAmount = succeededPayments.reduce((a, p) => a + p.paidDeliveryAmount, 0);

        // 4) دمج بيانات الطلب + بيانات صاحب الطلب
        const finalPayments = succeededPayments.map(payment => {
            const order = completedOrders.find(
                o => o._id.toString() === payment.tripPriceId.toString()
            );

            return {
                payment,
                order,
                customer: order?.createdBy
                    ? {
                        id: order.createdBy._id,
                        name: order.createdBy.fullName,
                        phone: order.createdBy.phone,
                        profileImage: order.createdBy.profileImage || null
                    }
                    : null
            };
        });

        return res.status(200).json({
            success: true,
            totalAmount,
            totalDeliveryRemaining,
            totalPaidDeliveryAmount,
            payments: finalPayments
        });

    } catch (error) {
        console.error("❌ Error fetching payment summary:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب البيانات",
            error: error.message
        });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await ComplaintModell.find()
            .populate("complainant", "fullName phone profileImage role")
            .populate({
                path: "orderId",
                populate: {
                    path: "assignedTo",
                    select: "fullName phone"
                }
            });

        if (!complaints.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                complaints: []
            });
        }

        const formattedComplaints = complaints.map(c => {
            const order = c.orderId;

            return {
                complaintId: c._id,
                message: c.message,
                status: c.status,
                createdAt: c.createdAt,

                complainant: {
                    id: c.complainant?._id,
                    name: c.complainant?.fullName,
                    phone: c.complainant?.phone,
                    profileImage: c.complainant?.profileImage || null,
                    role: c.complainantRole
                },

                order: {
                    orderId: order?._id,
                    orderNumber: order?.orderNumber,
                    customerName: order?.customerName,
                    customerPhone: order?.phone,
                    from: order?.source?.address,
                    to: order?.destination?.address,
                    orderPrice: order?.orderPrice,
                    deliveryPrice: order?.deliveryPrice,
                    totalPrice: order?.totalPrice,
                    status: order?.status,
                    subStatus: order?.subStatus,
                    toTime: order?.toTime,
                    fromTime: order?.fromTime,

                    delivery: order?.assignedTo
                        ? {
                            id: order.assignedTo._id,
                            name: order.assignedTo.fullName,
                            phone: order.assignedTo.phone
                        }
                        : null,

                    createdAt: order?.createdAt
                }
            };
        });

        return res.status(200).json({
            success: true,
            count: formattedComplaints.length,
            complaints: formattedComplaints
        });

    } catch (error) {
        console.error("❌ Error fetching complaints:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب الشكاوى",
            error: error.message
        });
    }
};









export const getAllWithdrawRequests = async (req, res) => {
    try {
        const withdraws = await Withdraw.find()
            .populate("driverId", "fullName phone email") // بيانات السائق
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: withdraws.length,
            withdraws
        });

    } catch (error) {
        console.error("❌ Get All Withdraws Error:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب كل عمليات السحب",
            error: error.message
        });
    }
};


export const getMyPendingWithdrawRequests = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "غير مصرح - يجب تسجيل الدخول"
            });
        }

        const { status } = req.query; // ابعت الحالة كـ query parameter: pending, approved, rejected, completed

        if (!status || !["pending", "approved", "rejected", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "حالة غير صالحة. استخدم: pending, approved, rejected, completed"
            });
        }

        const withdraws = await Withdraw.find({
            driverId: req.user._id,
            status
        }).sort({ createdAt: -1 });

        // لو الحالة rejected نضيف الحقل reason لكل طلب
        const response = withdraws.map(w => {
            const data = w.toObject();
            if (status === "rejected") {
                data.reason = w.reason || "";
            }
            return data;
        });

        return res.status(200).json({
            success: true,
            count: withdraws.length,
            withdraws: response
        });

    } catch (error) {
        console.error("❌ Get My Withdraws By Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب طلبات السحب",
            error: error.message
        });
    }
};




export const createWithdrawRequest = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "غير مصرح - يجب تسجيل الدخول"
            });
        }

        const { amount, provider, identifier } = req.body;

        if (!amount || !provider || !identifier) {
            return res.status(400).json({
                success: false,
                message: "جميع الحقول مطلوبة"
            });
        }

        // تحقق من نوع provider
        if (!["paypal", "bankAccount"].includes(provider)) {
            return res.status(400).json({
                success: false,
                message: "نوع وسيلة السحب غير صالح"
            });
        }

        // تحقق من الحقول حسب نوع السحب
        if (provider === "paypal") {
            if (!identifier.email || !identifier.name) {
                return res.status(400).json({
                    success: false,
                    message: "PayPal يحتاج Email & Name"
                });
            }
        }

        if (provider === "bankAccount") {
            if (!identifier.iban || !identifier.name) {
                return res.status(400).json({
                    success: false,
                    message: "الحساب البنكي يحتاج IBAN & Name"
                });
            }
        }

        const withdraw = await Withdraw.create({
            driverId: req.user._id,
            amount,
            provider,
            identifier,
            createdBy: null
        });

        return res.status(201).json({
            success: true,
            message: "تم إنشاء طلب السحب بنجاح",
            withdraw
        });

    } catch (error) {
        console.error("❌ Withdraw Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إنشاء طلب السحب",
            error: error.message
        });
    }
};














export const resetSucceededPayments = async (req, res) => {
    try {
        if (!req.user?._id || req.user.accountType !== "Owner") {
            return res.status(401).json({ success: false, message: "غير مصرح" });
        }

        const { deliveryIds } = req.body;
        if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
            return res.status(400).json({ success: false, message: "يرجى إرسال قائمة ID الدليفري" });
        }

        // 🔹 جلب الدليفري المحددة والتي حالتها completed
        const selectedDeliveries = await dliveryModel.find({
            _id: { $in: deliveryIds },
            status: "completed"
        }).populate("assignedTo", "fullName fcmToken");

        if (!selectedDeliveries.length) {
            return res.status(200).json({ success: true, message: "لا توجد دفعات لتصفيرها", updatedPaymentsCount: 0 });
        }

        // 🔹 تصفية المدفوعات المرتبطة بهذه الدليفري
        const paymentsToReset = await Payment.find({
            tripPriceId: { $in: selectedDeliveries.map(d => d._id.toString()) },
            status: "succeeded"
        });

        if (!paymentsToReset.length) {
            return res.status(200).json({ success: true, message: "لا توجد دفعات ناجحة لتصفيرها", updatedPaymentsCount: 0 });
        }

        // 🔹 تصفير المدفوعات
        const updateResult = await Payment.updateMany(
            { tripPriceId: { $in: paymentsToReset.map(p => p.tripPriceId) }, status: "succeeded" },
            { $set: { amount: 0, deliveryRemaining: 0, paidDeliveryAmount: 0 } }
        );

        // 🔹 إرسال إشعارات
        for (const delivery of selectedDeliveries) {
            const driver = delivery.assignedTo;
            if (!driver?.fcmToken) continue;

            const notificationBody = `تم تصفير الرصيد الخاص بك للطلب (${delivery._id}).`;

            try {
                await admin.messaging().send({
                    notification: { title: "تحديث حالة الرصيد", body: notificationBody },
                    data: { deliveryId: delivery._id.toString(), status: "reset", type: "WITHDRAW_STATUS" },
                    token: driver.fcmToken
                });
            } catch (err) {
                console.error(`❌ فشل إرسال الإشعار لـ ${driver.fullName}:`, err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "تم تصفير المدفوعات وإرسال الإشعارات بنجاح",
            updatedPaymentsCount: updateResult.modifiedCount,
            deliveries: selectedDeliveries
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "حدث خطأ أثناء تصفير المدفوعات", error: error.message });
    }
};











export const addFavoritePlace = async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "name, address, latitude, longitude مطلوبين"
            });
        }

        const favorite = await FavoritePlace.create({
            userId: req.user._id,
            name,
            address,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        });

        res.status(201).json({
            success: true,
            message: "تم إضافة المكان إلى المفضلة",
            data: favorite
        });

    } catch (err) {
        console.error("❌ Add Favorite Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إضافة المفضلة"
        });
    }
};


export const deleteFavoritePlace = async (req, res) => {
    try {
        const { favoriteId } = req.params;

        if (!favoriteId) {
            return res.status(400).json({
                success: false,
                message: "favoriteId مطلوب"
            });
        }

        // البحث عن المفضلة
        const favorite = await FavoritePlace.findOne({
            _id: favoriteId,
            userId: req.user._id
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "المكان غير موجود أو غير تابع لهذا المستخدم"
            });
        }

        // حذف المفضلة
        await FavoritePlace.deleteOne({ _id: favoriteId });

        res.status(200).json({
            success: true,
            message: "تم حذف المكان من المفضلة بنجاح"
        });

    } catch (err) {
        console.error("❌ Delete Favorite Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء حذف المفضلة"
        });
    }
};





export const getMyFavoritePlaces = async (req, res) => {
    try {
        const favorites = await FavoritePlace.find({ userId: req.user._id });

        res.status(200).json({
            success: true,
            count: favorites.length,
            data: favorites
        });

    } catch (err) {
        console.error("❌ Get Favorites Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب المفضلات"
        });
    }
};





export const updateOrderStatusdlivery = async (req, res) => {
    try {
        const { action } = req.body;
        const { orderId } = req.params;

        // التحقق من المستخدم
        const user = await Usermodel.findById(req.user._id);

        if (!user || user.accountType !== "ServiceProvider") {
            return res.status(403).json({
                success: false,
                message: "غير مسموح — هذا الإجراء متاح لمقدمي الخدمة فقط"
            });
        }

        // جلب الطلب
        const order = await dliveryModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "الطلب غير موجود"
            });
        }

        // الطلب مكتمل؟ ممنوع نغيره
        if (order.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "لا يمكن تغيير حالة طلب مكتمل"
            });
        }

        // تنفيذ العمليات
        let notificationTitle = "";
        let notificationBody = "";
        let notificationType = "";

        // ----------------------------------------------------------------------
        // ✔️ حالة قبول الطلب
        // ----------------------------------------------------------------------
        if (action === "accept") {

            order.status = "pending";
            order.subStatus = "assigned";
            order.assignedTo = req.user._id;

            notificationTitle = "✅ تم قبول عرضك!";
            notificationBody = `قام مقدم الخدمة ${user.fullName || ""} بقبول طلبك وهو في انتظار الدفع.`;
            notificationType = "ORDER_ACCEPTED";

        }
        // ----------------------------------------------------------------------
        // ✔️ حالة رفض الطلب
        // ----------------------------------------------------------------------
        else if (action === "reject") {

            order.status = "cancelled";
            order.subStatus = "by_driver";
            order.assignedTo = req.user._id;

            notificationTitle = "❌ تم رفض الطلب";
            notificationBody = `قام مقدم الخدمة ${user.fullName || ""} برفض الطلب.`;
            notificationType = "ORDER_REJECTED";

        }

        // ======================================================================
        // 🔥 الحالات الجديدة التي طلبتها بالظبط 🔥
        // ======================================================================

        // 🚗 الديلفري في الطريق لموقع الاستلام
        else if (action === "going_to_pickup") {

            order.status = "active";
            order.subStatus = "going_to_pickup";

            notificationTitle = "🚗 جاري التوجه لموقع الاستلام";
            notificationBody = `مقدم الخدمة ${user.fullName || ""} في الطريق إلى موقع استلام طلبك.`;
            notificationType = "GOING_TO_PICKUP";
        }

        // 📦 تم أخذ الطلب من موقع الاستلام
        else if (action === "picked") {

            order.status = "active";
            order.subStatus = "picked";

            notificationTitle = "📦 تم استلام الطلب";
            notificationBody = `قام مقدم الخدمة ${user.fullName || ""} باستلام الطلب من موقع الاستلام.`;
            notificationType = "ORDER_PICKED";
        }

        // 🛣️ الديلفري في الطريق لموقع التسليم
        else if (action === "going_to_destination") {

            order.status = "active";
            order.subStatus = "going_to_destination";

            notificationTitle = "🛵 في الطريق لموقع التسليم";
            notificationBody = `مقدم الخدمة ${user.fullName || ""} في الطريق لتسليم طلبك.`;
            notificationType = "GOING_TO_DESTINATION";
        }

        // 🎉 تم تسليم الطلب
        else if (action === "delivered") {

            order.status = "completed";
            order.subStatus = "delivered";

            notificationTitle = "🎉 تم تسليم الطلب بنجاح";
            notificationBody = `تم تسليم طلبك بواسطة ${user.fullName || ""}. شكرًا لاستخدامك خدمتنا!`;
            notificationType = "ORDER_DELIVERED";
        }

        else {
            return res.status(400).json({
                success: false,
                message: "قيمة action غير صالحة"
            });
        }

        await order.save();

        // ------------------------------------------------------------------
        // 🔥 إرسال الإشعار للعميل
        // ------------------------------------------------------------------

        const client = await Usermodel.findById(order.createdBy);

        if (client && client.fcmToken) {
            const token = client.fcmToken.trim();

            try {
                await admin.messaging().send({
                    notification: {
                        title: notificationTitle,
                        body: notificationBody,
                    },
                    data: {
                        orderId: order._id.toString(),
                        providerId: req.user._id.toString(),
                        type: notificationType
                    },
                    token
                });

                console.log("📨 تم إرسال إشعار تغيير حالة الطلب للعميل");

            } catch (err) {
                console.error("❌ فشل إرسال إشعار للعميل:", err.message);
            }
        } else {
            console.log("⚠️ العميل ليس لديه FCM Token");
        }

        // ------------------------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "تم تحديث حالة الطلب بنجاح",
            data: order
        });

    } catch (err) {
        console.error("❌ Order Status Update Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء تحديث حالة الطلب"
        });
    }
};





export const sendNotificationById = async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                success: false,
                message: "userId + title + body مطلوبين"
            });
        }

        // جلب المستخدم
        const user = await Usermodel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود"
            });
        }

        if (!user.fcmToken) {
            return res.status(400).json({
                success: false,
                message: "لا يوجد FCM Token للمستخدم"
            });
        }

        const token = user.fcmToken.trim();

        // إعداد رسالة الإشعار
        const message = {
            notification: {
                title,
                body
            },
            token
        };

        // لو فيه data ابعتها، لو مش فيه ما تبعتهاش
        if (data && typeof data === "object") {
            message.data = Object.fromEntries(
                Object.entries(data).map(([k, v]) => [String(k), String(v)])
            );
        }

        // إرسال الإشعار
        await admin.messaging().send(message);

        return res.status(200).json({
            success: true,
            message: "تم إرسال الإشعار بنجاح"
        });

    } catch (error) {
        console.error("❌ Notification Send Error:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إرسال الإشعار",
            error: error.message
        });
    }
};



// export const reviewWithdrawRequest = async (req, res) => {
//     try {
//         const { withdrawId, status, reason } = req.body;

//         // 🔹 تحقق من صلاحية المستخدم (Owner/Admin)
//         if (!req.user?._id || req.user.accountType !== "Owner") {
//             return res.status(401).json({
//                 success: false,
//                 message: "غير مصرح - يجب أن تكون مالك النظام"
//             });
//         }

//         if (!withdrawId || !status) {
//             return res.status(400).json({
//                 success: false,
//                 message: "withdrawId و status مطلوبين"
//             });
//         }

//         const withdraw = await Withdraw.findById(withdrawId).populate("driverId", "fullName fcmToken phone");
//         if (!withdraw) {
//             return res.status(404).json({ success: false, message: "طلب السحب غير موجود" });
//         }

//         // 🔹 تحديث الحالة
//         withdraw.status = status;
//         if (status === "rejected") {
//             if (!reason) {
//                 return res.status(400).json({ success: false, message: "السبب مطلوب عند الرفض" });
//             }
//             withdraw.reason = reason; // تخزين السبب مباشرة في الحقل المخصص
//         }
//         await withdraw.save();

//         // 🔹 إرسال الإشعار عبر FCM
//         const driver = withdraw.driverId;
//         if (driver?.fcmToken) {
//             let notificationBody = "";

//             if (status === "approved") {
//                 notificationBody = `تمت الموافقة على طلب السحب الخاص بك وسيتم إرسال الأموال في أقرب وقت.`;
//             } else if (status === "rejected") {
//                 notificationBody = `تم رفض طلب السحب الخاص بك. السبب: ${reason}`;
//             } else if (status === "completed") {
//                 notificationBody = `تم إرسال الأموال إلى حسابك. يرجى التحقق من محفظتك.`;
//             }

//             try {
//                 await admin.messaging().send({
//                     notification: {
//                         title: "تحديث حالة طلب السحب",
//                         body: notificationBody
//                     },
//                     data: {
//                         withdrawId: withdraw._id.toString(),
//                         status,
//                         type: "WITHDRAW_STATUS"
//                     },
//                     token: driver.fcmToken
//                 });
//             } catch (err) {
//                 console.error("❌ فشل إرسال الإشعار:", err.message);
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             message: `تم تحديث حالة طلب السحب إلى ${status}`,
//             withdraw
//         });

//     } catch (error) {
//         console.error("❌ Review Withdraw Request Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "حدث خطأ أثناء تحديث حالة طلب السحب",
//             error: error.message
//         });
//     }
// };


export const reviewWithdrawRequest = async (req, res) => {
    try {
        const { withdrawId, status, reason } = req.body;

        // if (!req.user?._id || req.user.accountType !== "Owner") {
        //     return res.status(401).json({
        //         success: false,
        //         message: "غير مصرح - يجب أن تكون مالك النظام"
        //     });
        // }

        if (!withdrawId || !status) {
            return res.status(400).json({
                success: false,
                message: "withdrawId و status مطلوبين"
            });
        }

        const withdraw = await Withdraw.findById(withdrawId).populate("driverId", "fullName fcmToken phone");
        if (!withdraw) {
            return res.status(404).json({ success: false, message: "طلب السحب غير موجود" });
        }

        // 🔹 تحديث الحالة
        withdraw.status = status;
        if (status === "rejected") {
            if (!reason) {
                return res.status(400).json({ success: false, message: "السبب مطلوب عند الرفض" });
            }
            withdraw.reason = reason;
        }
        await withdraw.save();

        // 🔹 خصم الرصيد عند اكتمال السحب
        if (status === "completed") {
            let remainingAmount = withdraw.amount;

            // جلب كل المدفوعات المتاحة للسحب
            const payments = await Payment.find({
                userId: withdraw.driverId._id,
                status: "succeeded",
                $or: [
                    { deliveryRemaining: { $gt: 0 } },
                    { paidDeliveryAmount: { $gt: 0 } }
                ]
            }).sort({ createdAt: 1 }); // الأقدم أولًا

            for (let p of payments) {
                if (remainingAmount <= 0) break;

                // خصم من deliveryRemaining
                const deductFromDelivery = Math.min(p.deliveryRemaining, remainingAmount);
                p.deliveryRemaining -= deductFromDelivery;
                remainingAmount -= deductFromDelivery;

                // خصم من paidDeliveryAmount لو باقي مبلغ
                if (remainingAmount > 0) {
                    const deductFromCommission = Math.min(p.paidDeliveryAmount, remainingAmount);
                    p.paidDeliveryAmount -= deductFromCommission;
                    remainingAmount -= deductFromCommission;
                }

                await p.save();
            }

            if (remainingAmount > 0) {
                // الرصيد غير كافي، ممكن ترفض أو تسجل فرق
                console.warn("رصيد الدليفري غير كافي لإتمام السحب بالكامل");
            }
        }

        // 🔹 إرسال إشعار FCM
        const driver = withdraw.driverId;
        if (driver?.fcmToken) {
            let notificationBody = "";

            if (status === "approved") {
                notificationBody = `تمت الموافقة على طلب السحب الخاص بك وسيتم إرسال الأموال في أقرب وقت.`;
            } else if (status === "rejected") {
                notificationBody = `تم رفض طلب السحب الخاص بك. السبب: ${reason}`;
            } else if (status === "completed") {
                notificationBody = `تم إرسال الأموال إلى حسابك. يرجى التحقق من محفظتك.`;
            }

            try {
                await admin.messaging().send({
                    notification: {
                        title: "تحديث حالة طلب السحب",
                        body: notificationBody
                    },
                    data: {
                        withdrawId: withdraw._id.toString(),
                        status,
                        type: "WITHDRAW_STATUS"
                    },
                    token: driver.fcmToken
                });
            } catch (err) {
                console.error("❌ فشل إرسال الإشعار:", err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: `تم تحديث حالة طلب السحب إلى ${status}`,
            withdraw
        });

    } catch (error) {
        console.error("❌ Review Withdraw Request Error:", error);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء تحديث حالة طلب السحب",
            error: error.message
        });
    }
};

export const reviewDeliveryAccount = asyncHandelr(async (req, res) => {
    const { userId, status, reason } = req.body;

    // // 1) التحقق من صلاحية الأدمن / Owner
    // if (!req.user?._id || req.user.accountType !== "Owner") {
    //     return res.status(401).json({
    //         success: false,
    //         message: "غير مصرح - يجب أن تكون Owner"
    //     });
    // }

    // 2) التحقق من البيانات المطلوبة
    if (!userId || !status) {
        return res.status(400).json({
            success: false,
            message: "userId و status مطلوبين"
        });
    }

    // 3) البحث عن المستخدم
    const user = await Usermodel.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "المستخدم غير موجود"
        });
    }

    // 4) تحديث الحالة
    user.status = status;
    if (status === "rejected") {
        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "السبب مطلوب عند الرفض"
            });
        }
        user.reason = reason; // لو عندك حقل للسبب
    }
    await user.save();

    // 5) إرسال الإشعار للمستخدم
    if (user.fcmToken) {
        let bodyMessage = "";

        if (status === "accepted") {
            bodyMessage = "تم قبول حسابك ويمكنك الآن البدء في العمل معنا 🚀";
        }
        else if (status === "rejected") {
            bodyMessage = `تم رفض حسابك. السبب: ${reason}`;
        }

        try {
            await admin.messaging().send({
                notification: {
                    title: "تحديث حالة حسابك",
                    body: bodyMessage
                },
                data: {
                    userId: user._id.toString(),
                    status,
                    type: "ACCOUNT_STATUS"
                },
                token: user.fcmToken
            });
        } catch (err) {
            console.error("❌ فشل إرسال الإشعار:", err.message);
        }
    }

    // 6) الرد النهائي
    return res.status(200).json({
        success: true,
        message: `تم تحديث حالة المستخدم إلى ${status}`,
        user
    });
});

export const createNegotiation = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newDeliveryPrice, message } = req.body;

        // التحقق من نوع الحساب
        if (req.user.accountType !== "ServiceProvider") {
            return res.status(403).json({
                success: false,
                message: "غير مصرح — التفاوض مسموح فقط لمقدم الخدمة"
            });
        }

        if (!newDeliveryPrice) {
            return res.status(400).json({
                success: false,
                message: "newDeliveryPrice مطلوب"
            });
        }

        // البحث عن الطلب
        const order = await dliveryModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "الطلب غير موجود"
            });
        }

        // ❌ التفاوض فقط لو الطلب pending
        if (order.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "لا يمكن التفاوض إلا على الطلبات في الانتظار"
            });
        }

        // إضافة التفاوض
        order.negotiations.push({
            offeredBy: req.user._id,
            newDeliveryPrice,
            message: message || ""
        });

        // تحديث subStatus
        order.subStatus = "has_offers";

        await order.save();


        // ------------------------------------------------------------------
        // 🔥🔥 إرسال إشعار للعميل صاحب الطلب عند وصول عرض جديد
        // ------------------------------------------------------------------

        const client = await Usermodel.findById(order.createdBy);

        if (client && client.fcmToken) {
            const token = client.fcmToken.trim();

            try {
                await admin.messaging().send({
                    notification: {
                        title: "📩 عرض جديد على طلبك!",
                        body: `قام مقدم خدمة بتقديم عرض جديد بسعر ${newDeliveryPrice} جنيه`
                    },
                    data: {
                        orderId: order._id.toString(),
                        providerId: req.user._id.toString(),
                        newDeliveryPrice: newDeliveryPrice.toString(),
                        type: "NEW_NEGOTIATION"
                    },
                    token
                });

                console.log("✅ تم إرسال إشعار العرض للعميل");
            } catch (err) {
                console.error("❌ فشل إرسال إشعار للعميل:", err.message);
            }
        } else {
            console.log("⚠️ العميل ليس لديه FCM Token");
        }

        // ------------------------------------------------------------------


        return res.status(201).json({
            success: true,
            message: "تم إضافة التفاوض بنجاح",
            data: order.negotiations[order.negotiations.length - 1]
        });

    } catch (err) {
        console.error("❌ Create Negotiation Error:", err);
        res.status(500).json({
            success: false,
            message: "خطأ أثناء إنشاء التفاوض"
        });
    }
};







// export const getMyPendingOrders = asyncHandelr(async (req, res, next) => {
//     const userId = req.user.id;

//     // التحقق من المستخدم
//     const user = await Usermodel.findById(userId);
//     if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

//     // ⭐ إضافة populate لجلب اسم ورقم مقدم العرض
//     const myPendingOrders = await dliveryModel.find({
//         createdBy: userId,
//         status: "pending"
//     })
//         .populate({
//             path: "negotiations.offeredBy",
//             select: "fullName phone"
//         })
//         .sort({ createdAt: -1 });

//     if (!myPendingOrders.length) {
//         return res.status(200).json({
//             success: true,
//             message: "ℹ️ لا توجد طلبات في الانتظار",
//             data: []
//         });
//     }

//     // ⭐ دمج بيانات مقدم العرض في كل negotiation
//     const formattedOrders = myPendingOrders.map(order => {
//         const newNegotiations = order.negotiations.map(n => ({
//             _id: n._id,
//             newDeliveryPrice: n.newDeliveryPrice,
//             message: n.message,
//             createdAt: n.createdAt,
//             offeredBy: n.offeredBy?._id,
//             offeredByName: n.offeredBy?.fullName || null,
//             offeredByPhone: n.offeredBy?.phone || null
//         }));

//         return {
//             ...order.toObject(),
//             negotiations: newNegotiations
//         };
//     });

//     return res.status(200).json({
//         success: true,
//         message: "✅ تم جلب الطلبات في الانتظار بنجاح",
//         count: formattedOrders.length,
//         data: formattedOrders
//     });
// });


export const getMyPendingOrders = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id;

    // التحقق من المستخدم
    const user = await Usermodel.findById(userId);
    if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    // ⭐ إضافة populate لجلب اسم ورقم مقدم العرض + assignedTo
    const myPendingOrders = await dliveryModel.find({
        createdBy: userId,
        status: "pending"
    })
        .populate({
            path: "negotiations.offeredBy",
            select: "fullName phone"
        })
        .populate({
            path: "assignedTo",
            select: "fullName phone profileImage"
        })
        .sort({ createdAt: -1 });

    if (!myPendingOrders.length) {
        return res.status(200).json({
            success: true,
            message: "ℹ️ لا توجد طلبات في الانتظار",
            data: []
        });
    }

    // ⭐ دمج بيانات مقدم العرض في كل negotiation
    const formattedOrders = myPendingOrders.map(order => {
        const newNegotiations = order.negotiations.map(n => ({
            _id: n._id,
            newDeliveryPrice: n.newDeliveryPrice,
            message: n.message,
            createdAt: n.createdAt,
            offeredBy: n.offeredBy?._id,
            offeredByName: n.offeredBy?.fullName || null,
            offeredByPhone: n.offeredBy?.phone || null
        }));

        // ⭐ لو في assignedTo رجّعه بالشكل المطلوب
        let assignedToData = null;
        if (order.assignedTo) {
            assignedToData = {
                id: order.assignedTo._id,
                name: order.assignedTo.fullName,
                profileImage: order.assignedTo.profileImage || null,
                phone: order.assignedTo.phone || null
            };
        }

        return {
            ...order.toObject(),
            negotiations: newNegotiations,
            assignedTo: assignedToData   // هنا النتيجة اللي أنت طلبتها
        };
    });

    return res.status(200).json({
        success: true,
        message: "✅ تم جلب الطلبات في الانتظار بنجاح",
        count: formattedOrders.length,
        data: formattedOrders
    });
});












export const getMycompletedOrders = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id;

    const user = await Usermodel.findById(userId);
    if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    // ⭐ إضافة populate لجلب اسم ورقم مقدم الخدمة في المفاوضات
    const myPendingOrders = await dliveryModel.find({
        createdBy: userId,
        status: "completed"
    })
        .populate({
            path: "negotiations.offeredBy",
            select: "fullName phone"
        })
        .sort({ createdAt: -1 });

    if (!myPendingOrders.length) {
        return res.status(200).json({
            success: true,
            message: "ℹ️ لا توجد طلبات في الانتظار",
            data: []
        });
    }

    // ⭐ تجهيز الشكل النهائي للبيانات مع دمج اسم ورقم مقدم العرض
    const formattedOrders = myPendingOrders.map(order => {
        const newNegotiations = order.negotiations.map(n => ({
            _id: n._id,
            newDeliveryPrice: n.newDeliveryPrice,
            message: n.message,
            createdAt: n.createdAt,
            offeredBy: n.offeredBy?._id,
            offeredByName: n.offeredBy?.fullName || null,
            offeredByPhone: n.offeredBy?.phone || null
        }));

        return {
            ...order.toObject(),
            negotiations: newNegotiations
        };
    });

    return res.status(200).json({
        success: true,
        message: "✅ تم جلب الطلبات في الانتظار بنجاح",
        count: formattedOrders.length,
        data: formattedOrders
    });
});






export const getMyactiveOrders = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id; // جلب userId من التوكن

    // التحقق من المستخدم
    const user = await Usermodel.findById(userId);
    if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    // ⭐ جلب الطلبات اللي حالتها active + populate زي pending
    const myActiveOrders = await dliveryModel.find({
        createdBy: userId,
        status: "active"
    })
        .populate({
            path: "negotiations.offeredBy",
            select: "fullName phone"
        })
        .populate({
            path: "assignedTo",
            select: "fullName phone profileImage"
        })
        .sort({ createdAt: -1 });

    if (!myActiveOrders.length) {
        return res.status(200).json({
            success: true,
            message: "ℹ️ لا توجد طلبات نشطة",
            data: []
        });
    }

    // ⭐ دمج بيانات التفاوض + assignedTo بنفس طريقة pending
    const formattedOrders = myActiveOrders.map(order => {
        const newNegotiations = order.negotiations.map(n => ({
            _id: n._id,
            newDeliveryPrice: n.newDeliveryPrice,
            message: n.message,
            createdAt: n.createdAt,
            offeredBy: n.offeredBy?._id,
            offeredByName: n.offeredBy?.fullName || null,
            offeredByPhone: n.offeredBy?.phone || null
        }));

        // ⭐ assignedTo data
        let assignedToData = null;
        if (order.assignedTo) {
            assignedToData = {
                id: order.assignedTo._id,
                name: order.assignedTo.fullName,
                profileImage: order.assignedTo.profileImage || null,
                phone: order.assignedTo.phone || null
            };
        }

        return {
            ...order.toObject(),
            negotiations: newNegotiations,
            assignedTo: assignedToData
        };
    });

    return res.status(200).json({
        success: true,
        message: "✅ تم جلب الطلبات النشطة بنجاح",
        count: formattedOrders.length,
        data: formattedOrders
    });
});




export const cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        // 🔍 التأكد من وجود الطلب
        const order = await dliveryModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "❌ الطلب غير موجود"
            });
        }

        // 🔒 تحقق أن المستخدم هو صاحب الطلب أو الدليفري المعين
        if (order.createdBy.toString() !== userId &&
            order.assignedTo?.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "❌ غير مصرح لك بإلغاء هذا الطلب"
            });
        }

        // 🔄 لو الطلب بالفعل ملغي
        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "ℹ️ الطلب ملغي مسبقًا"
            });
        }

        // تحديد من قام بالإلغاء
        let subStatus = "";
        if (order.createdBy.toString() === userId) {
            subStatus = "by_client";
        } else if (order.assignedTo?.toString() === userId) {
            subStatus = "by_driver";
        }

        // 🟢 تحديث بيانات الإلغاء
        order.status = "cancelled";
        order.subStatus = subStatus;
        order.cancellation = {
            isCanceled: true,
            canceledBy: userId,
            reason: reason || "",
            date: new Date()
        };

        await order.save();

        return res.status(200).json({
            success: true,
            message: "✅ تم إلغاء الطلب بنجاح",
            data: {
                id: order._id,
                status: order.status,
                subStatus: order.subStatus,
                cancellation: order.cancellation
            }
        });

    } catch (err) {
        console.error("❌ Cancel Order Error:", err);
        res.status(500).json({
            success: false,
            message: "فشل إلغاء الطلب"
        });
    }
};



export const getDeliveryHistory = async (req, res) => {
    try {
        const userId = req.user._id; // جاء من التوكن
        const { status } = req.query; // cancelled OR completed

        // لو مفيش status نبعت Error
        if (!status || !["cancelled", "completed"].includes(status)) {
            return res.status(400).json({
                message: "Invalid or missing status. Use ?status=cancelled OR ?status=completed"
            });
        }

        let filter = {
            assignedTo: userId,
            status: status
        };

        // === cancelled ONLY: return cancellation reason/details ===
        let projection = {};

        if (status === "cancelled") {
            projection = {
                customerName: 1,
                phone: 1,
                source: 1,
                destination: 1,
                deliveryPrice: 1,
                totalPrice: 1,
                orderNumber: 1,
                createdAt: 1,
                status: 1,
                subStatus: 1,
                "cancellation.reason": 1,
                "cancellation.canceledBy": 1,
                "cancellation.date": 1
            };
        }

        if (status === "completed") {
            projection = {
                customerName: 1,
                phone: 1,
                source: 1,
                destination: 1,
                deliveryPrice: 1,
                totalPrice: 1,
                orderNumber: 1,
                createdAt: 1,
                status: 1,
                subStatus: 1
            };
        }

        const orders = await dliveryModel
            .find(filter, projection)
            .populate("cancellation.canceledBy", "name phone") // لو عايز بيانات اللي لغى
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error("Error in getDeliveryHistory:", error);
        return res.status(500).json({ message: "Server errorr" });
    }
};




export const getMyInfo = async (req, res, next) => {
    try {
        const userId = req.user.id; // ✅ جاي من التوكن بعد الـ auth()

        const user = await Usermodel.findById(userId).select("fullName phone profileImage");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "❌ المستخدم غير موجود"
            });
        }

        return res.status(200).json({
            success: true,
            message: "✅ تم جلب بيانات المستخدم",
            data: {
                id: user._id,
                name: user.fullName,
                phone: user.phone,
                profileImage: user.profileImage || null
            }
        });

    } catch (err) {
        console.error("❌ getMyInfo Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء جلب البيانات"
        });
    }
};

export const createComplaint = async (req, res) => {
    try {
        const { fullName, phone, message } = req.body;

        if (!fullName || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "الاسم ورقم الهاتف ومحتوى الشكوى مطلوبين"
            });
        }

        const complaint = await Complaint.create({
            fullName,
            phone,
            message,
            userId: req.user ? req.user.id : null
        });

        return res.status(201).json({
            success: true,
            message: "تم إرسال الشكوى بنجاح",
            data: complaint
        });

    } catch (err) {
        console.error("❌ Create Complaint Error:", err);
        res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إرسال الشكوى"
        });
    }
};




export const getMyActiveOrdersForDelivery = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id; // ✅ جلب userId من التوكن

    // ✅ التحقق من وجود المستخدم
    const user = await Usermodel.findById(userId);
    if (!user) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    // ✅ جلب الطلبات اللي حالتها "active" ومُعيّنة لهذا الدليفري
    const myActiveOrders = await dliveryModel.find({
        assignedTo: userId,
        status: "active"
    })
        .populate({
            path: "negotiations.offeredBy",
            select: "fullName phone"
        })
        .sort({ createdAt: -1 });

    if (!myActiveOrders.length) {
        return res.status(200).json({
            success: true,
            message: "ℹ️ لا توجد طلبات نشطة حالياً",
            data: []
        });
    }

    // ✅ تجهيز الشكل النهائي للبيانات مع دمج اسم ورقم مقدم العرض (إن وجد)
    const formattedOrders = myActiveOrders.map(order => {
        const newNegotiations = order.negotiations.map(n => ({
            _id: n._id,
            newDeliveryPrice: n.newDeliveryPrice,
            message: n.message,
            createdAt: n.createdAt,
            offeredBy: n.offeredBy?._id,
            offeredByName: n.offeredBy?.fullName || null,
            offeredByPhone: n.offeredBy?.phone || null
        }));

        return {
            ...order.toObject(),
            negotiations: newNegotiations
        };
    });

    return res.status(200).json({
        success: true,
        message: "✅ تم جلب الطلبات النشطة ياعم الزفتssss  =",
        count: formattedOrders.length,
        data: formattedOrders
    });
});








function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const getPendingOrdersForDelivery = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id;

    // ✅ جلب بيانات الدليفري
    const deliveryUser = await Usermodel.findById(userId);
    if (!deliveryUser) return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));

    const deliveryLat = deliveryUser.location.coordinates[1];
    const deliveryLon = deliveryUser.location.coordinates[0];

    // ✅ جلب كل الطلبات في حالة pending مع populate لمقدم الخدمة في المفاوضات
    const pendingOrders = await dliveryModel.find({ status: "pending" })
        .populate({
            path: "negotiations.offeredBy",
            select: "fullName phone"
        })
        .sort({ createdAt: -1 });

    if (!pendingOrders.length) {
        return res.status(200).json({
            success: true,
            message: "ℹ️ لا توجد طلبات في الانتظار",
            data: []
        });
    }

    // ⭐ تجهيز الشكل النهائي للبيانات مع دمج اسم ورقم مقدم العرض وحساب المسافة
    const ordersWithDistance = pendingOrders.map(order => {
        const newNegotiations = order.negotiations.map(n => ({
            _id: n._id,
            newDeliveryPrice: n.newDeliveryPrice,
            message: n.message,
            createdAt: n.createdAt,
            offeredBy: n.offeredBy?._id,
            offeredByName: n.offeredBy?.fullName || null,
            offeredByPhone: n.offeredBy?.phone || null
        }));

        const sourceLat = order.source.location.coordinates[1];
        const sourceLon = order.source.location.coordinates[0];
        const distanceToSource = getDistanceFromLatLonInKm(deliveryLat, deliveryLon, sourceLat, sourceLon);

        return {
            ...order.toObject(),
            negotiations: newNegotiations,
            distanceToSource
        };
    });

    // ✅ ترتيب الطلبات من الأقرب للأبعد
    ordersWithDistance.sort((a, b) => a.distanceToSource - b.distanceToSource);

    return res.status(200).json({
        success: true,
        message: "✅ تم جلب الطلبات وترتيبها من الأقرب للأبعد بنجاح",
        count: ordersWithDistance.length,
        data: ordersWithDistance
    });
});
;








export const acceptNegotiationByClient = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { negotiationId, providerId } = req.body; // مرن: استخدم negotiationId أو providerId أو آخر negotiation

        // جلب الطلب
        const order = await dliveryModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "الطلب غير موجود" });
        }

        // التحقق إن الي بيبعت هو صاحب الطلب
        if (order.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "غير مصرح — فقط صاحب الطلب يقدر يقبل العرض" });
        }

        // لازم الطلب يكون في pending
        if (order.status !== "pending") {
            return res.status(400).json({ success: false, message: "لا يمكن قبول عرض على طلب غير في حالة pending" });
        }

        // لازم يكون فيه عروض أصلاً
        if (!order.negotiations || !order.negotiations.length) {
            return res.status(400).json({ success: false, message: "لا يوجد عروض لهذا الطلب" });
        }

        // تحديد الـ negotiation المراد قبوله
        let chosenNegotiation = null;

        if (negotiationId) {
            chosenNegotiation = order.negotiations.find(n => n._id.toString() === negotiationId.toString());
        } else if (providerId) {
            chosenNegotiation = order.negotiations.find(n => n.offeredBy.toString() === providerId.toString());
        } else {
            // لو مفيش حاجة اتبعتت نأخذ آخر عرض
            chosenNegotiation = order.negotiations[order.negotiations.length - 1];
        }

        if (!chosenNegotiation) {
            return res.status(400).json({ success: false, message: "العرض المحدد غير موجود" });
        }

        // تعيين السائق (offeredBy) كـ assignedTo
        order.assignedTo = chosenNegotiation.offeredBy;
        order.subStatus = "assigned";
        order.status = "pending"; // يبقى في الانتظار للحظة الدفع إن كان مطلوب

        await order.save();

        // إرسال إشعار إلى السائق المعين (assignedTo)
        const driver = await Usermodel.findById(order.assignedTo);
        if (driver) {
            const token = driver.fcmToken?.trim();
            const displayName = driver.fullName || driver._id.toString();

            if (token) {
                try {
                    await admin.messaging().send({
                        notification: {
                            title: "✅ تم قبول عرضك",
                            body: `تم قبول عرضك للطلب رقم ${order.orderNumber || order._id}. السعر: ${chosenNegotiation.newDeliveryPrice}`
                        },
                        data: {
                            orderId: order._id.toString(),
                            negotiationId: chosenNegotiation._id.toString(),
                            type: "OFFER_ACCEPTED",
                            newDeliveryPrice: chosenNegotiation.newDeliveryPrice?.toString() || ""
                        },
                        token
                    });

                    // حفظ الإشعار في الـ DB
                    await NotificationModell.create({
                        user: driver._id,
                        order: order._id,
                        title: "✅ تم قبول عرضك",
                        body: `تم قبول عرضك للطلب ${order.orderNumber || order._id}`,
                        deviceToken: token,
                        type: "OFFER_ACCEPTED"
                    });

                    console.log(`✅ أُرسل إشعار قبول العرض إلى ${displayName}`);
                } catch (err) {
                    console.error(`❌ فشل إرسال إشعار للسائق ${displayName}:`, err.message || err);
                }
            } else {
                console.log(`⚠️ السائق ${displayName} ليس لديه FCM token صالح`);
            }
        } else {
            console.log("⚠️ السائق المعين غير موجود في قاعدة البيانات");
        }

        return res.status(200).json({
            success: true,
            message: "تم قبول العرض وتعيين السائق بنجاح",
            data: { orderId: order._id, assignedTo: order.assignedTo, subStatus: order.subStatus }
        });

    } catch (err) {
        console.error("❌ Accept Negotiation Error:", err);
        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء قبول العرض"
        });
    }
};


export const createKiloPrice = asyncHandelr(async (req, res, next) => {
    let { kiloPrice, distance } = req.body;

    // لازم يكون واحد على الأقل موجود (مستقبلاً ممكن تبعت الاتنين مع بعض)
    if (kiloPrice === undefined && distance === undefined) {
        return next(new Error("❌ يجب إدخال (kiloPrice) أو (distance)", { cause: 400 }));
    }

    // تحويل للقيم الرقمية لو مرسلة كسلاسل
    if (kiloPrice !== undefined) kiloPrice = parseFloat(kiloPrice);
    if (distance !== undefined) distance = parseFloat(distance);

    // جلب السجل الحالي (لو موجود)
    const existingEntry = await KiloPriceModel.findOne();

    // لو مفيش سجل نهائيًا -> أنشئ واحد جديد بالحقول المرسلة
    if (!existingEntry) {
        const newEntry = await KiloPriceModel.create({
            kiloPrice: kiloPrice === undefined ? undefined : kiloPrice,
            distance: distance === undefined ? undefined : distance
        });

        return res.status(201).json({
            success: true,
            message: "✅ تم إنشاء الإعداد بنجاح",
            data: newEntry
        });
    }

    // لو في سجل موجود مسبقًا:
    // - لو المستخدم مرسل حقل موجود بالفعل -> يمنع
    // - لو المستخدم مرسل حقل غير موجود في السجل -> يحدث السجل بإضافة الحقل
    const updates = {};

    if (kiloPrice !== undefined) {
        // لو السجل يحتوي على kiloPrice مسبقًا -> ممنوع تكرار
        if (existingEntry.kiloPrice !== undefined && existingEntry.kiloPrice !== null) {
            return next(new Error("⚠️ سعر الكيلو موجود بالفعل، لا يمكن إضافته مرة أخرى", { cause: 400 }));
        }
        updates.kiloPrice = kiloPrice;
    }

    if (distance !== undefined) {
        // لو السجل يحتوي على distance مسبقًا -> ممنوع تكرار
        if (existingEntry.distance !== undefined && existingEntry.distance !== null) {
            return next(new Error("⚠️ المسافة (distance) موجودة بالفعل، لا يمكن إضافتها مرة أخرى", { cause: 400 }));
        }
        updates.distance = distance;
    }

    // لو مفيش تحديثات (يعني المستخدم حاول يرسل حقول لكن كلها موجودة) -> خطأ
    if (Object.keys(updates).length === 0) {
        return next(new Error("⚠️ لا توجد تغييرات جديدة لتطبيقها", { cause: 400 }));
    }

    // تطبيق التحديث وإرجاع السجل المحدّث
    const updated = await KiloPriceModel.findByIdAndUpdate(existingEntry._id, { $set: updates }, { new: true });

    return res.status(200).json({
        success: true,
        message: "✅ تم تحديث الإعداد بنجاح",
        data: updated
    });
});





export const getKiloPrice = asyncHandelr(async (req, res) => {
    const kilo = await KiloPriceModel.findOne().sort({ createdAt: -1 });
    if (!kilo) return res.status(404).json({ message: "⚠️ لا يوجد سعر كيلو بعد" });

    res.json({
        success: true,
        data: kilo
    });
});

// ✅ تعديل سعر الكيلو
export const updateKiloPrice = asyncHandelr(async (req, res, next) => {
    const { id } = req.params;
    let { kiloPrice, distance } = req.body;

    // ❗ لازم المستخدم يرسل حاجة واحدة على الأقل
    if (kiloPrice === undefined && distance === undefined) {
        return next(new Error("❌ يجب إدخال (kiloPrice) أو (distance) للتعديل", { cause: 400 }));
    }

    // تحويل لقيم رقمية لو مرسلة كسلاسل
    if (kiloPrice !== undefined) kiloPrice = parseFloat(kiloPrice);
    if (distance !== undefined) distance = parseFloat(distance);

    const updates = {};
    if (kiloPrice !== undefined) updates.kiloPrice = kiloPrice;
    if (distance !== undefined) updates.distance = distance;

    const updated = await KiloPriceModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
    );

    if (!updated) {
        return next(new Error("❌ لم يتم العثور على الإعداد المطلوب", { cause: 404 }));
    }

    res.json({
        success: true,
        message: "✅ تم تعديل البيانات بنجاح",
        data: updated
    });
});

// ✅ حذف سعر الكيلو
export const deleteKiloPrice = asyncHandelr(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await KiloPriceModel.findByIdAndDelete(id);

    if (!deleted) {
        return next(new Error("❌ لم يتم العثور على سعر الكيلو المطلوب حذفه", { cause: 404 }));
    }

    res.json({
        success: true,
        message: "🗑️ تم حذف سعر الكيلو بنجاح"
    });
});






export const updateUserLocation = asyncHandelr(async (req, res, next) => {
    const userId = req.user.id; // ✅ جلب userId من التوكن
    const { longitude, latitude } = req.query; // ✅ جلب من query

    // ✅ التحقق من القيم المطلوبة
    if (longitude === undefined || latitude === undefined) {
        return next(new Error("❌ يجب إرسال longitude و latitude في query", { cause: 400 }));
    }

    // ✅ التحقق من أن المستخدم موجود
    const user = await Usermodel.findById(userId);
    if (!user) {
        return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));
    }

    // ✅ تحديث الإحداثيات
    user.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // تحويل النص إلى رقم
    };

    await user.save();

    return res.json({
        success: true,
        message: "✅ تم تحديث إحداثيات المستخدم بنجاح",
        data: {
            userId: user._id,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
        }
    });
});





export const loginAdmin = asyncHandelr(async (req, res, next) => {
    const { identifier, password } = req.body; // identifier يمكن أن يكون إيميل أو رقم هاتف
    console.log(identifier, password);

    const checkUser = await Usermodel.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (checkUser?.provider === providerTypes.google) {
        return next(new Error("Invalid account", { cause: 404 }));
    }

    if (!checkUser.isConfirmed) {
        return next(new Error("Please confirm your email tmm ", { cause: 404 }));
    }

    // 🔒 شرط السماح بالدخول فقط لـ Owner أو Admin
    if (!["Owner", "Admin"].includes(checkUser.accountType)) {
        return next(new Error("غير مسموح لك بتسجيل الدخول", { cause: 403 }));
    }

    if (!comparehash({ planText: password, valuehash: checkUser.password })) {
        return next(new Error("Password is incorrect", { cause: 404 }));
    }

    const access_Token = generatetoken({
        payload: { id: checkUser._id },
    });

    const refreshToken = generatetoken({
        payload: { id: checkUser._id },
        expiresIn: "365d"
    });

    return successresponse(res, "Done", 200, { access_Token, refreshToken, checkUser });
});


















// export const loginwithGmail = asyncHandelr(async (req, res, next) => {
//     const { idToken } = req.body;
//     const client = new OAuth2Client();

//     async function verify() {
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: process.env.CIENT_ID,
//         });
//         return ticket.getPayload();
//     }

//     const payload = await verify();
//     console.log("Google Payload Data:", payload);

//     const { name, email, email_verified, picture } = payload;

//     if (!email) {
//         return next(new Error("Email is missing in Google response", { cause: 400 }));
//     }
//     if (!email_verified) {
//         return next(new Error("Email not verified", { cause: 404 }));
//     }

//     let user = await dbservice.findOne({
//         model: Usermodel,
//         filter: { email },
//     });

//     if (user?.provider === providerTypes.system) {
//         return next(new Error("Invalid account", { cause: 404 }));
//     }

//     if (!user) {
//         user = await dbservice.create({
//             model: Usermodel,
//             data: {
//                 email,
//                 username: name,
//                 profilePic: { secure_url: picture },
//                 isConfirmed: email_verified,
//                 provider: providerTypes.google,
//             },
//         });
//     }

//     const access_Token = generatetoken({
//         payload: { id: user._id },
//         // signature: user?.role === roletypes.Admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
//     });

//     const refreshToken = generatetoken({
//         payload: { id: user._id },
//         // signature: user?.role === roletypes.Admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
//         expiresIn: "365d"
//     });
//     return successresponse(res, "Login successful", 200, { access_Token, refreshToken })

// });

export const refreshToken = asyncHandelr(async (req, res, next) => {

    const user = await decodedToken({ authorization: req.headers.authorization, tokenType: tokenTypes.refresh })

    const accessToken = generatetoken({
        payload: { id: user._id },
        // signature: user.role === 'Admin' ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN,
    });

    // 7. إنشاء refresh token جديد
    const newRefreshToken = generatetoken({
        payload: { id: user._id },
        // signature: user.role === 'Admin' ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: "365d"// سنة واحدة
    });

    // 8. إرجاع الرد الناجح
    return successresponse(res, "Token refreshed successfully", 200, { accessToken, refreshToken: newRefreshToken });
});


 
export const forgetpassword = asyncHandelr(async (req, res, next) => {
    const { email } = req.body;
    console.log(email);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    Emailevent.emit("forgetpassword", { email })

    return successresponse(res);
});






export const resetpassword = asyncHandelr(async (req, res, next) => {
    const { email, password, code } = req.body;
    console.log(email, password, code);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (!comparehash({ planText: code, valuehash: checkUser.forgetpasswordOTP })) {

        return next(new Error("code not match", { cause: 404 }));
    }

    const hashpassword = generatehash({ planText: password })
    await Usermodel.updateOne({ email }, {

        password: hashpassword,
        isConfirmed: true,
        changeCredentialTime: Date.now(),
        $unset: { forgetpasswordOTP: 0, otpExpiresAt: 0, attemptCount: 0 },

    })

    return successresponse(res);
});


export const resendOTP = asyncHandelr(async (req, res, next) => {
    const { email } = req.body;
    console.log(email);

    const checkUser = await Usermodel.findOne({ email });
    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    
    if (checkUser.otpExpiresAt && checkUser.otpExpiresAt > Date.now()) {
        return next(new Error("Please wait before requesting a new code", { cause: 429 }));
    }


    const otp = customAlphabet("0123456789", 6)();
    const forgetpasswordOTP = generatehash({ planText: otp });

  
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

 
    await Usermodel.updateOne(
        { email },
        {
            forgetpasswordOTP,
            otpExpiresAt,
            attemptCount: 0
        }
    );


    const html = vervicaionemailtemplet({ code: otp });
    await sendemail({ to: email, subject: "Resend OTP", html });

    console.log("OTP resent successfully!");
    return successresponse(res, "A new OTP has been sent to your email.");
});

// $2y$10$ZHEfQKrayDl6V3JwOwnyreovYvhG.zTMW6mIedMEOjjoTr2R367Zy

// const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || "$2y$10$q3BAdOAyWapl3B9YtEVXK.DHmJf/yaOqF4U.MpbBmR8bwjSxm4A6W";
// const AUTHENTICA_VERIFY_URL = "https://api.authentica.sa/api/v1/verify-otp";

// export const verifyOTP = async (req, res, next) => {
//     const { phone, otp } = req.body;

//     if (!phone || !otp) {
//         return res.status(400).json({ success: false, error: "❌ يجب إدخال رقم الهاتف و OTP" });
//     }

//     try {
//         const user = await dbservice.findOne({
//             model: Usermodel,
//             filter: { mobileNumber: phone }
//         });

//         if (!user) {
//             return next(new Error("❌ رقم الهاتف غير مسجل", { cause: 404 }));
//         }

//         console.log("📨 جاري التحقق من OTP بالبيانات:", { phone, otp, session_id: undefined });

//         const response = await axios.post(
//             AUTHENTICA_VERIFY_URL,
//             {
//                 phone,
//                 otp,
//                 session_id: undefined  // مؤقتًا نرسله undefined حتى نعرف من الرد هل هو مطلوب
//             },
//             {
//                 headers: {
//                     "X-Authorization": AUTHENTICA_API_KEY,
//                     "Content-Type": "application/json",
//                     "Accept": "application/json"
//                 },
//             }
//         );

//         console.log("📩 استجابة API من AUTHENTICA:", JSON.stringify(response.data, null, 2));

//         if (response.data.status === true && response.data.message === "OTP verified successfully") {
//             await dbservice.updateOne({
//                 model: Usermodel,
//                 filter: { mobileNumber: phone },
//                 data: { isConfirmed: true }
//             });

//             const access_Token = generatetoken({ payload: { id: user._id } });
//             const refreshToken = generatetoken({ payload: { id: user._id }, expiresIn: "365d" });

//             return res.json({
//                 success: true,
//                 message: "✅ OTP صحيح، تم التحقق بنجاح!",
//                 access_Token,
//                 refreshToken
//             });
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "❌ OTP غير صحيح",
//                 details: response.data
//             });
//         }
//     } catch (error) {
//         console.error("❌ فشل التحقق من OTP:", error.response?.data || error.message);

//         return res.status(500).json({
//             success: false,
//             error: "❌ فشل التحقق من OTP",
//             details: error.response?.data || error.message
//         });
//     }
// };



const AUTHENTICA_API_KEY = "ad5348edf3msh15d5daec987b64cp183e9fjsne1092498134c";
const AUTHENTICA_BASE_URL = "https://authentica1.p.rapidapi.com/api/v2";
export async function verifyOTP(phone, otp) {
    try {
        const response = await axios.post(
            `${AUTHENTICA_BASE_URL}/verify-otp`,
            {
                phone: phone,
                otp: otp,
            },
            {
                headers: {
                    "x-rapidapi-key": AUTHENTICA_API_KEY,
                    "x-rapidapi-host": "authentica1.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        console.log("✅ OTP Verified:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "❌ OTP Verification Failed:",
            error.response?.data || error.message
        );
        throw error;
    }
}



// export const confirEachOtp = asyncHandelr(async (req, res, next) => {
//     const { code, email, phone } = req.body;

//     if (!code || (!email && !phone)) {
//         return next(new Error("يرجى إدخال الكود ورقم الهاتف أو البريد الإلكتروني", { cause: 400 }));
//     }

//     // ✅ تحقق عن طريق الهاتف باستخدام AUTHENTICA
//     if (phone) {
//         const user = await dbservice.findOne({
//             model: Usermodel,
//             isConfirmed: false,
//             filter: { phone }
//         });

//         if (!user) {
//             return next(new Error("رقم الهاتف غير مسجل", { cause: 404 }));
//         }

//         try {
//             const response = await axios.post(
//                 "https://api.authentica.sa/api/v1/verify-otp",
//                 {
//                     phone,
//                     otp: code,
//                     session_id: undefined
//                 },
//                 {
//                     headers: {
//                         "X-Authorization": process.env.AUTHENTICA_API_KEY,
//                         "Content-Type": "application/json",
//                         "Accept": "application/json"
//                     }
//                 }
//             );

//             console.log("📩 AUTHENTICA response:", response.data);

//             if (response.data.status === true && response.data.message === "OTP verified successfully") {
//                 await dbservice.updateOne({
//                     model: Usermodel,
//                     filter: { phone },
//                     data: { isConfirmed: true }
//                 });

//                 const access_Token = generatetoken({ payload: { id: user._id } });
//                 const refreshToken = generatetoken({ payload: { id: user._id }, expiresIn: "365d" });

//                 return successresponse(res, "✅ تم التحقق من رقم الهاتف بنجاح", 200, {
//                     access_Token,
//                     refreshToken,
//                     user
//                 });
//             } else {
//                 return next(new Error("❌ كود التحقق غير صحيح", { cause: 400 }));
//             }

//         } catch (error) {
//             console.error("❌ AUTHENTICA Error:", error.response?.data || error.message);
//             return next(new Error("❌ فشل التحقق من OTP عبر الهاتف", { cause: 500 }));
//         }
//     }

//     // ✅ تحقق عن طريق البريد الإلكتروني (محلي)
//     if (email) {
//         const user = await dbservice.findOne({ model: Usermodel, isConfirmed: false, filter: { email } });

//         if (!user) return next(new Error("البريد الإلكتروني غير مسجل", { cause: 404 }));

//         if (user.isConfirmed) return next(new Error("البريد الإلكتروني مؤكد بالفعل", { cause: 400 }));

//         if (Date.now() > new Date(user.otpExpiresAt).getTime()) {
//             return next(new Error("انتهت صلاحية الكود", { cause: 400 }));
//         }

//         const isValidOTP = comparehash({ planText: `${code}`, valuehash: user.emailOTP });
//         if (!isValidOTP) {
//             const attempts = (user.attemptCount || 0) + 1;

//             if (attempts >= 5) {
//                 await Usermodel.updateOne({ email }, {
//                     blockUntil: new Date(Date.now() + 2 * 60 * 1000),
//                     attemptCount: 0
//                 });
//                 return next(new Error("تم حظرك مؤقتًا بعد محاولات خاطئة كثيرة", { cause: 429 }));
//             }

//             await Usermodel.updateOne({ email }, { attemptCount: attempts });
//             return next(new Error("كود التحقق غير صحيح", { cause: 400 }));
//         }

//         await Usermodel.updateOne({ email }, {
//             isConfirmed: true,
//             $unset: { emailOTP: 0, otpExpiresAt: 0, attemptCount: 0, blockUntil: 0 }
//         });

//         const access_Token = generatetoken({ payload: { id: user._id } });
//         const refreshToken = generatetoken({ payload: { id: user._id }, expiresIn: "365d" });

//         return successresponse(res, "✅ تم تأكيد البريد الإلكتروني بنجاح", 200, {
//             access_Token,
//             refreshToken,
//             user
//         });
//     }
// });


export const confirEachOtp = asyncHandelr(async (req, res, next) => {
    const { code, phone } = req.body;

    if (!code || !phone) {
        return next(new Error("يرجى إدخال الكود ورقم الهاتف", { cause: 400 }));
    }

    const baseFilter = { phone };

    // ✅ تحقق عن طريق الهاتف فقط
    const user = await dbservice.findOne({
        model: Usermodel,
        filter: baseFilter
    });

    if (!user) return next(new Error("رقم الهاتف غير مسجل", { cause: 404 }));

    if (user.isConfirmed) {
        return successresponse(res, "✅ رقم الهاتف تم تأكيده مسبقًا", 200, { user });
    }

    try {
        const response = await axios.post(
            "https://authentica1.p.rapidapi.com/api/v2/verify-otp",
            { phone, otp: code },
            {
                headers: {
                    "x-rapidapi-key": process.env.AUTHENTICA_API_KEY,
                    "x-rapidapi-host": "authentica1.p.rapidapi.com",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        console.log("📩 AUTHENTICA response:", response.data);

        if (response.data?.status === true || response.data?.message === "OTP verified successfully") {
            await dbservice.updateOne({
                model: Usermodel,
                filter: { _id: user._id },
                data: { isConfirmed: true },
            });

            const access_Token = generatetoken({ payload: { id: user._id } });
            const refreshToken = generatetoken({
                payload: { id: user._id },
                expiresIn: "365d",
            });

            return successresponse(res, "✅ تم التحقق من رقم الهاتف بنجاح", 200, {
                access_Token,
                refreshToken,
                user,
            });
        } else {
            return next(new Error("❌ كود التحقق غير صحيح", { cause: 400 }));
        }

    } catch (error) {
        console.error("❌ AUTHENTICA Error:", error.response?.data || error.message);
        return next(new Error("❌ فشل التحقق من OTP عبر الهاتف", { cause: 500 }));
    }
});











export const forgetPasswordphone = asyncHandelr(async (req, res, next) => {
    const { phone } = req.body;
    console.log(phone);

   
    if (!phone) {
        return next(new Error("❌ يجب إدخال رقم الهاتف", { cause: 400 }));
    }

    // 🔍 البحث عن المستخدم باستخدام رقم الهاتف
    const checkUser = await Usermodel.findOne({ mobileNumber: phone });
    if (!checkUser) {
        return next(new Error("❌ رقم الهاتف غير مسجل", { cause: 404 }));
    }

    // 🔹 إرسال OTP عبر Authentica
    try {
        const response = await axios.post(
            AUTHENTICA_OTP_URL,
            {
                phone: phone,
                method: "whatsapp",  // أو "sms" حسب الحاجة
                number_of_digits: 6,
                otp_format: "numeric",
                is_fallback_on: 0
            },
            {
                headers: {
                    "X-Authorization": AUTHENTICA_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }
        );

        console.log("✅ OTP تم إرساله بنجاح:", response.data);

        return res.json({ success: true, message: "✅ OTP تم إرساله إلى رقم الهاتف بنجاح" });
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: "❌ فشل في إرسال OTP",
            details: error.response?.data || error.message
        });
    }
});



export const forgetPasswordphoneadmin = asyncHandelr(async (req, res, next) => {
    const { phone } = req.body;
    console.log(phone);

    if (!phone) {
        return next(new Error("❌ يجب إدخال رقم الهاتف", { cause: 400 }));
    }

    // 🔍 البحث عن المستخدم باستخدام رقم الهاتف
    const checkUser = await Usermodel.findOne({ mobileNumber: phone });
    if (!checkUser) {
        return next(new Error("❌ رقم الهاتف غير مسجل", { cause: 404 }));
    }

    // ✅ السماح فقط للمستخدمين من نوع Owner أو Admin
    const allowedRoles = ['Owner', 'Admin'];
    if (!allowedRoles.includes(checkUser.role)) {
        return next(new Error("❌ هذا الحساب غير مصرح له بإعادة تعيين كلمة المرور", { cause: 403 }));
    }

    // 🔹 إرسال OTP عبر Authentica
    try {
        const response = await axios.post(
            AUTHENTICA_OTP_URL,
            {
                phone: phone,
                method: "whatsapp",  // أو "sms" حسب الحاجة
                number_of_digits: 6,
                otp_format: "numeric",
                is_fallback_on: 0
            },
            {
                headers: {
                    "X-Authorization": AUTHENTICA_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }
        );

        console.log("✅ OTP تم إرساله بنجاح:", response.data);

        return res.json({ success: true, message: "✅ OTP تم إرساله إلى رقم الهاتف بنجاح" });
    } catch (error) {
        console.error("❌ فشل في إرسال OTP:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: "❌ فشل في إرسال OTP",
            details: error.response?.data || error.message
        });
    }
});





export const resetPasswordphone= asyncHandelr(async (req, res, next) => {
    const { phone, password, otp } = req.body;

   
    if (!phone || !password || !otp) {
        return next(new Error("❌ جميع الحقول مطلوبة: رقم الهاتف، كلمة المرور، والـ OTP", { cause: 400 }));
    }


    const user = await Usermodel.findOne({ mobileNumber: phone });
    if (!user) {
        return next(new Error("❌ المستخدم غير موجود", { cause: 404 }));
    }

    try {
       
        const response = await axios.post(
            "https://api.authentica.sa/api/v1/verify-otp",
            { phone, otp },
            {
                headers: {
                    "X-Authorization": process.env.AUTHENTICA_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            }
        );

        console.log("📩 استجابة API:", response.data);

       
        if (response.data.status === true && response.data.message === "OTP verified successfully") {
            const hashpassword = generatehash({ planText: password });

            await Usermodel.updateOne(
                { mobileNumber: phone },
                {
                    password: hashpassword,
                    isConfirmed: true,
                    changeCredentialTime: Date.now(),
                }
            );

            return successresponse(res, "✅ تم إعادة تعيين كلمة المرور بنجاح", 200);
        } else {
            return next(new Error("❌ OTP غير صحيح", { cause: 400 }));
        }
    } catch (error) {
        console.error("❌ فشل التحقق من OTP:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: "❌ فشل التحقق من OTP",
            details: error.response?.data || error.message,
        });
    }
});

export const loginwithGmail = asyncHandelr(async (req, res, next) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return next(new Error("Access token is required", { cause: 400 }));
    }

    // Step 1: Get user info from Google
    let userInfo;
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        userInfo = response.data;
    } catch (error) {
        console.error("Failed to fetch user info from Google:", error?.response?.data || error.message);
        return next(new Error("Failed to verify access token with Google", { cause: 401 }));
    }

    const { email, name, picture, email_verified } = userInfo;

    if (!email) {
        return next(new Error("Email is missing in Google response", { cause: 400 }));
    }
    if (!email_verified) {
        return next(new Error("Email not verified", { cause: 403 }));
    }


    let user = await dbservice.findOne({
        model: Usermodel,
        filter: { email },
    });

    if (user?.provider === providerTypes.system) {
        return next(new Error("Invalid account. Please login using your email/password", { cause: 403 }));
    }


    if (!user) {
        let userId;
        let isUnique = false;
        while (!isUnique) {
            userId = Math.floor(1000000 + Math.random() * 9000000);
            const existingUser = await dbservice.findOne({
                model: Usermodel,
                filter: { userId },
            });
            if (!existingUser) isUnique = true;
        }

        user = await dbservice.create({
            model: Usermodel,
            data: {
                email,
                username: name,
                profilePic: { secure_url: picture },
                isConfirmed: email_verified,
                provider: providerTypes.google,
                userId, // ✅ Add generated userId here
                gender: "Male", // لو تقدر تجيبه من جوجل أو تخليه undefined
            },
        });
    }

    // Step 4: Generate tokens
    const access_Token = generatetoken({
        payload: { id: user._id, country: user.country },
    });

    const refreshToken = generatetoken({
        payload: { id: user._id },
        expiresIn: "365d"
    });

    return successresponse(res, "Done", 200, { access_Token, refreshToken, user });
});
 

export const deleteMyAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await Usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "❌ لم يتم العثور على الحساب." });
        }

        // تنفيذ الحذف
        await Usermodel.findByIdAndDelete(userId);

        res.status(200).json({
            message: "✅ تم حذف حسابك بنجاح.",
            deletedUserId: userId,
        });
    } catch (err) {
        console.error("❌ Error in deleteMyAccount:", err);
        res.status(500).json({
            message: "❌ حدث خطأ أثناء حذف الحساب.",
            error: err.message,
        });
    }
};
  

export const loginRestaurant = asyncHandelr(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);

    // ✅ لازم ترجع كلمة المرور عشان تقدر تقارنها
    const checkUser = await Usermodel.findOne({ email }).select('+password');

    if (!checkUser) {
        return next(new Error("User not found", { cause: 404 }));
    }

    if (!checkUser.isConfirmed) {
        return next(new Error("Please confirm your email tmm ", { cause: 404 }));
    }
    // ✅ قارن كلمة المرور المشفرة
    const isMatch = await comparehash({ planText: password, valuehash: checkUser.password });

    if (!isMatch) {
        return next(new Error("Password is incorrect", { cause: 404 }));
    }

    // ✅ توليد Access Token و Refresh Token
    const access_Token = generatetoken({
        payload: { id: checkUser._id }
    });

    const refreshToken = generatetoken({
        payload: { id: checkUser._id },
        expiresIn: "365d"
    });

    const restaurantLink = `https://morezk12.github.io/Restaurant-system/#/restaurant/${checkUser.subdomain}`;

    // ✅ رجع كل بيانات المستخدم + التوكنات
    const allData = {
        message: "Login successful",
        id: checkUser._id,
        fullName: checkUser.fullName,
        email: checkUser.email,
        phone: checkUser.phone,
        country: checkUser.country,
        subdomain: checkUser.subdomain,
        restaurantLink,
        access_Token,
        refreshToken
    };

    return successresponse(res, allData, 200);
});


export const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user._id; // ✅ جاي من التوكن

        // هات بيانات المستخدم من الـ DB مع الحقول اللي محتاجها بس
        const user = await Usermodel.findById(userId)
            .select("fullName email phone totalPoints modelcar serviceType carImages profiePicture isAgree");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "⚠️ المستخدم غير موجود"
            });
        }

        return res.status(200).json({
            success: true,
            message: "✅ تم جلب البروفايل بنجاح",
            data: user
        });

    } catch (error) {
        next(error);
    }
};















export const getMyCompactProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // جلب الحقول المطلوبة بما فيها subscription
        const user = await Usermodel.findById(userId)
            .select("fullName email phone profiePicture subscription");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "⚠️ المستخدم غير موجود"
            });
        }

        const now = new Date();
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        // نقرأ مباشرة من subscription
        const startDate = user.subscription?.startDate ? new Date(user.subscription.startDate) : null;
        const endDate = user.subscription?.endDate ? new Date(user.subscription.endDate) : null;
        const planType = user.subscription?.planType || "FreeTrial";

        // حساب الأيام المتبقية والايام المستخدمة فقط لو موجود start و end
        let daysLeft = 0;
        let daysUsed = 0;

        if (startDate && endDate) {
            const diffLeftMs = endDate.getTime() - now.getTime();
            daysLeft = diffLeftMs > 0 ? Math.ceil(diffLeftMs / MS_PER_DAY) : 0;

            const diffUsedMs = now.getTime() - startDate.getTime();
            daysUsed = diffUsedMs > 0 ? Math.floor(diffUsedMs / MS_PER_DAY) : 0;
        }

        return res.status(200).json({
            success: true,
            message: "✅ تم جلب بيانات البروفايل المختصرة بنجاح",
            data: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                profiePicture: user.profiePicture || null,
                planType,
                daysLeft,
                daysUsed,
                startDate,
                endDate
            }
        });

    } catch (error) {
        next(error);
    }
};




export const createOrUpdateSettings = asyncHandelr(async (req, res, next) => {
    const { whatsappNumber, privacyPolicy } = req.body;

    let settings = await AppSettingsSchema.findOne();
    if (!settings) {
        settings = await AppSettingsSchema.create({ whatsappNumber, privacyPolicy });
    } else {
        settings.whatsappNumber = whatsappNumber || settings.whatsappNumber;
        settings.privacyPolicy = privacyPolicy || settings.privacyPolicy;
        await settings.save();
    }

    return successresponse(res, "✅ تم حفظ الإعدادات بنجاح", 200, { settings });
});


export const getSettings = asyncHandelr(async (req, res, next) => {
    const settings = await AppSettingsSchema.findOne();
    return successresponse(res, "✅ تم جلب الإعدادات بنجاح", 200, { settings });
});

export const getAppSettingsAdmin = asyncHandelr(async (req, res, next) => {
    // 🔍 جلب الإعدادات من قاعدة البيانات
    const settings = await AppSettingsSchema.find();

    // ✅ إذا ما فيش إعدادات، نرجع مصفوفة فاضية
    if (!settings || settings.length === 0) {
        return successresponse(res, "ℹ️ لا توجد إعدادات حالياً", 200, { settings: [] });
    }

    // ✅ إرجاع البيانات في شكل Array
    return successresponse(res, "✅ تم جلب الإعدادات بنجاح", 200, { settings });
});



export const getCompletedOrders = asyncHandelr(async (req, res) => {

    // 1) هنجمع كل الطلبات اللي خلصت
    const orders = await dliveryModel.find({
        status: { $in: ["completed", "active"] }
    })
        .populate({
            path: "assignedTo",
            select: "fullName phone"
        })
        .sort({ createdAt: -1 });

    // 2) تنسيق البيانات بشكل منظم
    const formatted = orders.map(order => ({
        orderId: order._id,
        orderNumber: order.orderNumber,

        customerName: order.customerName,
        customerPhone: order.phone,

        from: order.source?.address,
        to: order.destination?.address,

        orderPrice: order.orderPrice,
        deliveryPrice: order.deliveryPrice,
        totalPrice: order.totalPrice,

        status: order.status,
        subStatus: order.subStatus,
        toTime: order.toTime,
        fromTime: order.fromTime,

        delivery: order.assignedTo ? {
            id: order.assignedTo._id,
            name: order.assignedTo.fullName,
            phone: order.assignedTo.phone
        } : null,

        createdAt: order.createdAt
    }));

    return res.status(200).json({
        success: true,
        count: formatted.length,
        orders: formatted
    });
});






// services/twilio.service.js






