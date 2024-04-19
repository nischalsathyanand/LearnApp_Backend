const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt'); // Include bcrypt for password hashing
const mongoose = require('mongoose');
const path = require('path');
const port = 3000;
const EveryDayObject = require('./models/EveryDayObject');
const cors = require("cors");


// cors
const corsOptions = {
    origin: "http://localhost:1234",
    credentials: true,
};
app.use(cors(corsOptions));



app.use(bodyParser.json());
// Function to hash password securely
async function hashPassword(password) {
    if (!password) {
        throw new Error('Password is required');
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}


// MONGO
const uri =
    "mongodb+srv://nischalsathyanand:nischal123@cluster0.06igqyd.mongodb.net/testDB?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });



// Define an async function to save EveryDayObjects
async function saveEveryDayObjects() {
    // add EveryDayObjects to Db
    const everyDayObjects = new EveryDayObject({
        everyDayObjects: {
            'boy': {
                imageFileNames: ['boy1.png', 'boy2.png', 'boy3.png', 'boy4.png'],
                audioFileName: 'boy.mp3'
            },
            'bridge': {
                imageFileNames: ['bridge1.png', 'bridge2.png', 'bridge3.png', 'bridge4.png'],
                audioFileName: 'bridge.mp3'
            },
            'car': {
                imageFileNames: ['car1.png', 'car2.png', 'car3.png'],
                audioFileName: 'car.mp3'
            },
            'girl': {
                imageFileNames: ['girl1.png', 'girl2.png', 'girl3.png','girl4.png'],
                audioFileName: 'girl.mp3'
            },
            'tree': {
                imageFileNames: ['tree1.png', 'tree2.png', 'tree3.png'],
                audioFileName: 'tree.mp3'
            },
           

        }
    })

    try {
        await everyDayObjects.save();
        console.log('EveryDayObject saved successfully!');
    } catch (err) {
        console.error(err);
    }
}

// Call the async function to save EveryDayObjects

//saveEveryDayObjects();



// REGISTER
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already exists' });
        }

        // Hash password before saving
        const hashedPassword = await hashPassword(password);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).send({ message: 'User registration successful!' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).send({ message: 'Server error occurred' });
    }
});

app.use('/files', express.static(path.join(__dirname, 'files')));
app.get('/', (req, res) => {
    res.send('Welcome to the Image Server!');
});
// LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        // Compare hashed password with user input
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        // Handle successful login (e.g., generate session token)
        res.send({ message: 'Login successful!', user: { email: user.email, username: user.username } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send({ message: 'Server error occurred' });
    }
});





app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


// router

let api = require('./router/api');
app.use('/api', api);