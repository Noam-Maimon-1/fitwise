const UsersModel    = require('../../models/users.model');
const ProfilesModel = require('../../models/profiles.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError,
    sendForbidden
} = require('../middleware/errorHandlers');

const {
    validateId,
    getMissingFields,
    validatePositiveNumericFields
} = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// GET /api/users
const getAllUsers = async (req, res) => {
    try {
        return sendSuccess(res, 200, await UsersModel.getAll());
    } catch (err) {
        console.error('[Users]', err);
        return sendServerError(res);
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        const user = await UsersModel.getById(id);

        if (!user) {
            return sendNotFound(res, 'User not found', {});
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = parseInt(req.headers['x-user-id']);

        if (!isAdminRole(userRole) && requestUserId !== id) {
            return sendNotFound(res, 'User not found', {});
        }

        const { password, ...safeUser } = user;
        return sendSuccess(res, 200, safeUser);
    } catch (err) {
        console.error('[Users]', err);
        return sendServerError(res);
    }
};

// GET /api/users/me
const getMe = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!validateId(userId)) {
            return sendValidationError(res, 'x-user-id header is required and must be a valid number', {});
        }

        const user = await UsersModel.getById(userId);

        if (!user) {
            return sendNotFound(res, 'User not found', {});
        }

        const { password, ...safeUser } = user;
        return sendSuccess(res, 200, safeUser);
    } catch (err) {
        console.error('[Users]', err);
        return sendServerError(res);
    }
};

// POST /api/users
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, userRole, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;

        const missingFields = getMissingFields(req.body, ['firstName', 'lastName', 'email', 'password', 'userRole', 'age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoal']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required user fields', { missingFields });
        }

        const invalidNumericFields = validatePositiveNumericFields(req.body, ['age', 'height', 'weight']);
        if (invalidNumericFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric fields', { invalidFields: invalidNumericFields });
        }

        if (!['beginner', 'intermediate', 'advanced'].includes(activityLevel)) {
            return sendValidationError(res, 'Invalid activity level', {
                field: 'activityLevel',
                allowedValues: ['beginner', 'intermediate', 'advanced'],
                value: activityLevel
            });
        }

        if (!['male', 'female', 'other'].includes(gender)) {
            return sendValidationError(res, 'Invalid gender', { field: 'gender', allowedValues: ['male', 'female', 'other'], value: gender });
        }

        if (!['user', 'admin', 'manager'].includes(userRole)) {
            return sendValidationError(res, 'Invalid user role', { field: 'userRole', allowedValues: ['user', 'admin', 'manager'], value: userRole });
        }

        if (!['weight_loss', 'muscle_gain', 'maintenance'].includes(fitnessGoal)) {
            return sendValidationError(res, 'Invalid fitness goal', {
                field: 'fitnessGoal',
                allowedValues: ['weight_loss', 'muscle_gain', 'maintenance'],
                value: fitnessGoal
            });
        }

        let newUser;
        try {
            newUser = await UsersModel.create({ firstName, lastName, email, password, userRole });
        } catch (err) {
            if (err.code === 'P2002') {
                return sendValidationError(res, 'Email already in use', { field: 'email', value: email });
            }
            throw err;
        }
        await ProfilesModel.create({
            userId: newUser.userid,
            age, gender, height,
            currentWeight: weight,
            targetWeight: weight,
            fitnessGoal, activityLevel,
            onboardingCompleted: false
        });
        return sendSuccess(res, 201, await UsersModel.getById(newUser.userid));
    } catch (err) {
        console.error('[Users] createUser', err);
        return sendServerError(res);
    }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        if (!(await UsersModel.getById(id))) {
            return sendNotFound(res, 'User not found', {});
        }

        const { firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal } = req.body;

        const missingFields = getMissingFields(req.body, ['firstName', 'lastName', 'userRole', 'age', 'gender', 'height', 'weight', 'activityLevel', 'fitnessGoal']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required user fields', { missingFields });
        }

        const invalidNumericFields = validatePositiveNumericFields(req.body, ['age', 'height', 'weight']);
        if (invalidNumericFields.length > 0) {
            return sendValidationError(res, 'Invalid numeric fields', { invalidFields: invalidNumericFields });
        }

        if (!['beginner', 'intermediate', 'advanced'].includes(activityLevel)) {
            return sendValidationError(res, 'Invalid activity level', {
                field: 'activityLevel',
                allowedValues: ['beginner', 'intermediate', 'advanced'],
                value: activityLevel
            });
        }

        if (!['male', 'female'].includes(gender)) {
            return sendValidationError(res, 'Invalid gender', { field: 'gender', allowedValues: ['male', 'female'], value: gender });
        }

        if (!['user', 'admin', 'manager'].includes(userRole)) {
            return sendValidationError(res, 'Invalid user role', { field: 'userRole', allowedValues: ['user', 'admin', 'manager'], value: userRole });
        }

        if (!['weight_loss', 'muscle_gain', 'maintenance'].includes(fitnessGoal)) {
            return sendValidationError(res, 'Invalid fitness goal', {
                field: 'fitnessGoal',
                allowedValues: ['weight_loss', 'muscle_gain', 'maintenance'],
                value: fitnessGoal
            });
        }

        const updated = await UsersModel.update(id, { firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal });
        return sendSuccess(res, 200, updated);
    } catch (err) {
        console.error('[Users]', err);
        return sendServerError(res);
    }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid id', { field: 'id', value: req.params.id });
        }

        const deleted = await UsersModel.remove(id);

        if (!deleted) {
            return sendNotFound(res, 'User not found', {});
        }

        return sendSuccess(res, 200, deleted);
    } catch (err) {
        console.error('[Users]', err);
        return sendServerError(res);
    }
};

module.exports = { getAllUsers, getUserById, getMe, createUser, updateUser, deleteUser };
