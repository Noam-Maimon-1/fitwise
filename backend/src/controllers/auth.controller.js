const UsersModel                = require('../../models/users.model');
const ProfilesModel             = require('../../models/profiles.model');
const SettingsModel             = require('../../models/settings.model');
const SupportConversationModel  = require('../../models/supportConversation.model');
const UserPresenceModel         = require('../../models/userPresence.model');
const { generatePlan }          = require('../services/planGenerator');
const { sendSuccess, sendValidationError, sendServerError } = require('../middleware/errorHandlers');

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendValidationError(res, 'Email and password are required', {
                missingFields: [!email && 'email', !password && 'password'].filter(Boolean)
            });
        }

        const user = await UsersModel.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                data: null,
                error: { code: 'UNAUTHORIZED', message: 'Invalid email or password', details: {} }
            });
        }

        return sendSuccess(res, 200, {
            userId: user.userid,
            firstName: user.firstName,
            lastName: user.lastName,
            userRole: user.userRole,
            email: user.email
        });

    } catch (err) {
        console.error('[Auth]', err);
        return sendServerError(res);
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    return sendSuccess(res, 200, { message: 'Logged out successfully' });
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const {
            firstName, lastName, email, password,
            age, gender, height, weight,
            fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay
        } = req.body;

        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'age', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel', 'workoutsPerWeek', 'mealsPerDay'];
        const missingFields = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');

        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required fields', { missingFields });
        }

        if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(String(firstName).trim())) {
            return sendValidationError(res, 'Name may only contain letters, spaces, hyphens, and apostrophes', { field: 'firstName', value: firstName });
        }

        if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(String(lastName).trim())) {
            return sendValidationError(res, 'Name may only contain letters, spaces, hyphens, and apostrophes', { field: 'lastName', value: lastName });
        }

        const existing = await UsersModel.findByEmail(email);
        if (existing) {
            return sendValidationError(res, 'An account with this email already exists', { field: 'email', value: email });
        }

        if (!['weight_loss', 'muscle_gain', 'maintenance'].includes(fitnessGoal)) {
            return sendValidationError(res, 'Invalid fitness goal', {
                field: 'fitnessGoal',
                allowedValues: ['weight_loss', 'muscle_gain', 'maintenance'],
                value: fitnessGoal
            });
        }

        if (!['beginner', 'intermediate', 'advanced'].includes(activityLevel)) {
            return sendValidationError(res, 'Invalid activity level', {
                field: 'activityLevel',
                allowedValues: ['beginner', 'intermediate', 'advanced'],
                value: activityLevel
            });
        }

        if (!['male', 'female', 'other'].includes(gender)) {
            return sendValidationError(res, 'Invalid gender', {
                field: 'gender',
                allowedValues: ['male', 'female', 'other'],
                value: gender
            });
        }

        if (!Number.isInteger(Number(age)) || Number(age) < 13 || Number(age) > 120) {
            return sendValidationError(res, 'Age must be a whole number between 13 and 120', { field: 'age', value: age });
        }

        if (Number(height) < 100 || Number(height) > 250) {
            return sendValidationError(res, 'Height must be between 100 and 250 cm', { field: 'height', value: height });
        }

        if (Number(weight) < 30 || Number(weight) > 300) {
            return sendValidationError(res, 'Weight must be between 30 and 300 kg', { field: 'weight', value: weight });
        }

        if (!Number.isInteger(Number(workoutsPerWeek)) || Number(workoutsPerWeek) < 1 || Number(workoutsPerWeek) > 7) {
            return sendValidationError(res, 'Workouts per week must be a whole number between 1 and 7', { field: 'workoutsPerWeek', value: workoutsPerWeek });
        }

        if (!Number.isInteger(Number(mealsPerDay)) || Number(mealsPerDay) < 1 || Number(mealsPerDay) > 8) {
            return sendValidationError(res, 'Meals per day must be a whole number between 1 and 8', { field: 'mealsPerDay', value: mealsPerDay });
        }

        const newUser = await UsersModel.create({
            firstName, lastName, email, password,
            age, gender, height, weight,
            fitnessGoal, activityLevel,
            userRole: 'user'
        });

        const newProfile = await ProfilesModel.create({
            userId: newUser.userid,
            age, gender, height,
            currentWeight: weight,
            targetWeight: weight,
            fitnessGoal, activityLevel,
            workoutsPerWeek, mealsPerDay,
            onboardingCompleted: true
        });

        await SettingsModel.create({
            userId:      newUser.userid,
            displayName: `${firstName} ${lastName}`,
            email
        });

        const plan = await generatePlan({...newProfile, userId: newUser.userid, firstName: newUser.firstName });
        await ProfilesModel.update(newProfile.userId, plan);

        // Bootstrap support conversation and presence for new users
        await SupportConversationModel.getOrCreate(newUser.userid);
        await UserPresenceModel.upsert(newUser.userid, { isOnline: false, lastSeen: new Date() });

        return sendSuccess(res, 201, {
            userId: newUser.userid,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            userRole: newUser.userRole,
            caloricTarget: plan.caloricTarget
        });

    } catch (err) {
        console.error('[Auth]', err);
        return sendServerError(res);
    }
};

module.exports = { login, logout, register };
