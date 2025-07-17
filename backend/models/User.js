const bcrypt = require('bcryptjs');
const validator = require('validator');
const { Schema, model} = require("mongoose");


const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [4, 'Username must be at least 4 characters'],
        maxlength: [20, 'Username must be at most 20 characters'],

    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email address is not valid'
        }
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName:{
        type: String,
        trim: true,
    },
    location: {
        zipCode: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        }
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
const User = model('User', userSchema);

module.exports = User;