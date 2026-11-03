const bcrypt = require('bcryptjs');
const prisma = require('../prisma/prismaClient');

const BCRYPT_ROUNDS = 10;

// Public shape of a user. Deliberately excludes the password hash so it can
// never leak through an API response.
const mapUser = (u, updateDate) => ({
    userid: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    createDate: u.created_at,
    updateDate: updateDate || u.created_at,
    userRole: u.role,
    age: u.profile ? u.profile.age : null,
    gender: u.profile ? u.profile.gender : null,
    height: u.profile ? u.profile.height_cm : null,
    weight: u.profile ? u.profile.current_weight : null,
    activityLevel: u.profile ? u.profile.activity_level : null,
    fitnessGoal: u.profile ? u.profile.fitness_goal : null
});

const getAll = async () => {
    const users = await prisma.user.findMany({ include: { profile: true } });
    return users.map((u) => mapUser(u));
};

const getById = async (id) => {
    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    return user ? mapUser(user) : null;
};

const findByEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    return user ? mapUser(user) : null;
};

// Login only: returns the public user plus the stored hash.
// Never send this object to a client.
const findCredentialsByEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    return user ? { user: mapUser(user), passwordHash: user.password } : null;
};

const verifyPassword = (plainPassword, passwordHash) => bcrypt.compare(plainPassword, passwordHash);

const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

const create = async (data) => {
    const created = await prisma.user.create({
        data: {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: await hashPassword(data.password),
            role: data.userRole
        },
        include: { profile: true }
    });
    return mapUser(created);
};

const update = async (id, data) => {
    const userUpdate = {};
    if (data.firstName !== undefined) userUpdate.first_name = data.firstName;
    if (data.lastName !== undefined) userUpdate.last_name = data.lastName;
    if (data.userRole !== undefined) userUpdate.role = data.userRole;

    const profileUpdate = {};
    if (data.age !== undefined) profileUpdate.age = data.age;
    if (data.gender !== undefined) profileUpdate.gender = data.gender;
    if (data.height !== undefined) profileUpdate.height_cm = data.height;
    if (data.weight !== undefined) profileUpdate.current_weight = data.weight;
    if (data.activityLevel !== undefined) profileUpdate.activity_level = data.activityLevel;
    if (data.fitnessGoal !== undefined) profileUpdate.fitness_goal = data.fitnessGoal;

    try {
        await prisma.$transaction(async (tx) => {
            if (Object.keys(userUpdate).length > 0) {
                await tx.user.update({ where: { id }, data: userUpdate });
            }
            if (Object.keys(profileUpdate).length > 0) {
                await tx.profile.upsert({
                    where: { user_id: id },
                    update: profileUpdate,
                    create: { user_id: id, ...profileUpdate }
                });
            }
        });
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }

    const updated = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
    return mapUser(updated, new Date());
};

const remove = async (id) => {
    try {
        const deleted = await prisma.user.delete({ where: { id }, include: { profile: true } });
        return mapUser(deleted);
    } catch (err) {
        if (err.code === 'P2025') return null;
        throw err;
    }
};

module.exports = {
    getAll, getById, findByEmail, findCredentialsByEmail,
    verifyPassword, hashPassword, create, update, remove
};
