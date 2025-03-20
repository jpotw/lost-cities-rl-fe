Welcome to the Lost Cities Game, featuring a cutting-edge AI opponent.

This AI is powered by advanced Reinforcement Learning (PPO) with a bespoke reward function, designed to elevate your gaming experience.

<br>

### Game Rules
![how to play](/public/images/how-to-play.png)

### Game Snapshots

![game-example-1](/public/images/game-example-1.png)

![game-example-2](/public/images/game-example-2.png)

<br>

Currently it sucks at the game. The AI is still in training. Will update the README when it gets better.

<br>

### Launching the Project

1. **Backend Repository Setup**  
   Begin by cloning the backend repository from GitHub:  
   [Lost Cities RL Backend](https://github.com/jpotw/lost-cities-rl-be)

2. **Virtual Environment & Dependencies**  
   Set up a virtual environment, activate it, and install the necessary dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate 
   # On Windows: . venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Initiate the Backend Server**  
   Fire up the backend server with the command:
   ```bash
   uvicorn app.main:app --reload --port 8080
   ```

4. **Frontend Repository Setup**  
   Clone the frontend repository from GitHub:  
   [Lost Cities RL Frontend](https://github.com/jpotw/lost-cities-rl-fe)

5. **Frontend Dependencies Installation**  
   Navigate to the frontend directory and install all dependencies:
   ```bash
   yarn install
   ```

6. **Launch the Frontend Server**  
   Start the frontend server using:
   ```bash
   yarn dev
   ```

7. **Experience the Game**  
   Dive into the game by visiting:  
   [http://localhost:3000/](http://localhost:3000/)