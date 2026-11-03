const CheckInsModel = require('../../models/checkIns.model');
const ProfilesModel = require('../../models/profiles.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

const { validateId, getMissingFields } = require('../middleware/validation');

const { isAdminRole } = require('../middleware/roleUtils');

// Recomputes the user's profile.current_weight from their check-in history.
// Always uses the check-in with the latest date, so create/update/delete all
// stay consistent regardless of which record was touched.
const syncProfileWeight = async (userId) => {
    const all = await CheckInsModel.getByUserId(userId);
    if (all.length === 0) {
        await ProfilesModel.update(userId, { currentWeight: null });
    } else {
        const latest = all.reduce((a, b) =>
            new Date(a.checkInDate) >= new Date(b.checkInDate) ? a : b
        );
        await ProfilesModel.update(userId, { currentWeight: latest.weight });
    }
};

// GET /api/check-ins
const getAllCheckIns = async (req, res) => {
    try {
        const requestUserId = Number(req.headers.userid);

        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid', value: req.headers.userid || null });
        }

        return sendSuccess(res, 200, await CheckInsModel.getByUserId(requestUserId));
    } catch (err) {
        console.error('[CheckIns]', err);
        return sendServerError(res);
    }
};

// GET /api/check-ins/:id
const getCheckInById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = await CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        return sendSuccess(res, 200, checkIn);
    } catch (err) {
        console.error('[CheckIns]', err);
        return sendServerError(res);
    }
};

// POST /api/check-ins
const createCheckIn = async (req, res) => {
    try {
        const missingFields = getMissingFields(req.body, ['checkInDate', 'weight', 'workoutsCompleted']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required check-in fields', { missingFields });
        }

        const requestUserId = Number(req.headers.userid);
        if (!validateId(requestUserId)) {
            return sendValidationError(res, 'Missing or invalid user id in request headers', { field: 'userid' });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        if (typeof weight !== 'number' || weight < 30 || weight > 300) {
            return sendValidationError(res, 'Weight must be a number between 30 and 300 kg', { field: 'weight', value: weight });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0 || workoutsCompleted > 7) {
            return sendValidationError(res, 'Workouts completed must be a number between 0 and 7', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        const today = new Date().toISOString().split('T')[0];
        if (!checkInDate || checkInDate < '2000-01-01' || checkInDate > today) {
            return sendValidationError(res, 'Date must be between 2000-01-01 and today', { field: 'checkInDate', value: checkInDate });
        }

        const newCheckIn = await CheckInsModel.create({ userId: requestUserId, weight, workoutsCompleted, feedback, checkInDate });
        await syncProfileWeight(requestUserId);
        return sendSuccess(res, 201, newCheckIn);
    } catch (err) {
        console.error('[CheckIns]', err);
        return sendServerError(res);
    }
};

// PUT /api/check-ins/:id
const updateCheckIn = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = await CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const missingFields = getMissingFields(req.body, ['checkInDate', 'weight', 'workoutsCompleted']);
        if (missingFields.length > 0) {
            return sendValidationError(res, 'Missing required check-in fields', { missingFields });
        }

        const { checkInDate, weight, workoutsCompleted, feedback } = req.body;

        if (typeof weight !== 'number' || weight < 30 || weight > 300) {
            return sendValidationError(res, 'Weight must be a number between 30 and 300 kg', { field: 'weight', value: weight });
        }

        if (typeof workoutsCompleted !== 'number' || workoutsCompleted < 0 || workoutsCompleted > 7) {
            return sendValidationError(res, 'Workouts completed must be a number between 0 and 7', { field: 'workoutsCompleted', value: workoutsCompleted });
        }

        const today = new Date().toISOString().split('T')[0];
        if (!checkInDate || checkInDate < '2000-01-01' || checkInDate > today) {
            return sendValidationError(res, 'Date must be between 2000-01-01 and today', { field: 'checkInDate', value: checkInDate });
        }

        const updated = await CheckInsModel.update(id, { weight, workoutsCompleted, feedback, checkInDate });
        await syncProfileWeight(checkIn.userId);
        return sendSuccess(res, 200, updated);
    } catch (err) {
        console.error('[CheckIns]', err);
        return sendServerError(res);
    }
};

// DELETE /api/check-ins/:id
const deleteCheckIn = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!validateId(id)) {
            return sendValidationError(res, 'Invalid check-in id', { field: 'id', value: req.params.id });
        }

        const checkIn = await CheckInsModel.getById(id);

        if (!checkIn) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const userRole = req.headers['x-user-role'];
        const requestUserId = Number(req.headers.userid);

        if (!isAdminRole(userRole) && checkIn.userId !== requestUserId) {
            return sendNotFound(res, 'Check-in not found', { checkInId: id });
        }

        const deleted = await CheckInsModel.remove(id);
        await syncProfileWeight(checkIn.userId);
        return sendSuccess(res, 200, { checkInId: deleted.checkInId });
    } catch (err) {
        console.error('[CheckIns]', err);
        return sendServerError(res);
    }
};

module.exports = { getAllCheckIns, getCheckInById, createCheckIn, updateCheckIn, deleteCheckIn };
