const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fake data for now
let users = [
    {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('password', 10), // Hash the password 'password'
    },
];

exports.signup = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user and store it in our fake array
    const newUser = { id: Date.now(), username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
};