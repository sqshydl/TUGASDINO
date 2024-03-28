const express = require('express');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log('server Running on 3000');
});