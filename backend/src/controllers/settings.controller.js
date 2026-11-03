const SettingsModel = require('../../models/settings.model');
const UsersModel    = require('../../models/users.model');

const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError
} = require('../middleware/errorHandlers');

// GET /api/settings
const getSettings = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        const settings = await SettingsModel.getByUserId(userId);

        if (!settings) {
            return sendSuccess(res, 200, {
                displayName: '', email: '', theme: 'light'
            });
        }

        return sendSuccess(res, 200, settings);
    } catch (err) {
        console.error('[Settings]', err);
        return sendServerError(res);
    }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        const userId = parseInt(req.headers['x-user-id']);

        if (!userId || isNaN(userId)) {
            return sendValidationError(res, 'x-user-id header is required', {});
        }

        if (!(await SettingsModel.getByUserId(userId))) {
            return sendNotFound(res, 'Settings not found for this user', {});
        }

        const { firstName, lastName, theme } = req.body;

        if (!firstName || !lastName || !theme) {
            return sendValidationError(res, 'firstName, lastName, and theme are required', {
                missingFields: [!firstName && 'firstName', !lastName && 'lastName', !theme && 'theme'].filter(Boolean)
            });
        }

        const NAME_REGEX = /^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/;

        if (!NAME_REGEX.test(firstName.trim())) {
            return sendValidationError(res, 'Name may only contain letters, spaces, hyphens, and apostrophes', {
                field: 'firstName',
                value: firstName
            });
        }

        if (!NAME_REGEX.test(lastName.trim())) {
            return sendValidationError(res, 'Name may only contain letters, spaces, hyphens, and apostrophes', {
                field: 'lastName',
                value: lastName
            });
        }

        await UsersModel.update(userId, { firstName: firstName.trim(), lastName: lastName.trim() });

        await SettingsModel.update(userId, {
            displayName: `${firstName.trim()} ${lastName.trim()}`,
            theme,
        });

        return sendSuccess(res, 200, { firstName: firstName.trim(), lastName: lastName.trim(), theme });
    } catch (err) {
        console.error('[Settings]', err);
        return sendServerError(res);
    }
};

module.exports = { getSettings, updateSettings };
