# Lab 1: Node.js and Express Server

## Student Details
- Name: G. Hemanth Venkata Sai
- Registration Number: 252U1R6088
- Section: CSE AIML-2B

## Objective
To create a web server using Node.js HTTP module and Express.js framework.

## Technologies Used
- Node.js
- Express.js
- JavaScript
- Visual Studio Code

## Installation and Execution

1. Install Node.js.
2. Open the project folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Run the Node.js HTTP server:

```bash
node server.js
```

5. Run the Express server:

```bash
node app.js
```

## Endpoints

| Method | Endpoint | Description | Status |
|---|---|---|---|
| GET | / | Welcome message | 200 |
| GET | /about | Displays name and section | 200 |
| GET | /time | Displays current date and time | 200 |
| GET | /contact | Unknown route response | 404 |

## Screenshots

### Home Route
![Home](screenshots/1-home.png)

### About Route
![About](screenshots/2-about.png)

### Time Route
![Time](screenshots/3-time.png)

### 404 Error
![404](screenshots/4-error-404.png)

## Notes
Successfully created a Node.js HTTP server and an Express server. Tested all routes in the browser and verified their status codes.