const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LoginUser = require('../models/LoginUser');

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await LoginUser.findOne({ where: { USERNAME: username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const newUser = await LoginUser.create({ USERNAME: username, PWD: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

// Connexion
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }


    try {
        // Trouver l'utilisateur dans la base de données
        const user = await LoginUser.findOne({ where: { USERNAME: username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.PWD);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Mettre à jour le dernier login
        user.LASTLOGIN_TIME = new Date();
        await user.save();

        // Générer un token
        const token = jwt.sign({ userId: user.ID_LOGIN_USER }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.ID_LOGIN_USER, username: user.USERNAME, isAdmin: user.IsADMIN_LOGIN } });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
};