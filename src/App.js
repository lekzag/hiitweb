import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.css";


const exerciseList = ["burpees", "push up", "squat", "crunch", "jumping jack", "russian twist", "mountain climber", "plank", "lunges", "high knees", "jump rope", "diamond push ups", "sit ups", "pull ups", "L-sit", "wall sit", "calf raises", "side plank", "superman", "hamstring curl", "wide push ups", "flutterkicks", "pistol squats", "hip thrust", "one leg lunge", "bulagarian squat", "jump lunges", "bear walk", "step up", "crab walk", "archer push ups"];

const App = () => {
  const [rounds, setRounds] = useState(3);
  const [breakTime, setBreakTime] = useState(5);
  const [exerciseTime, setExerciseTime] = useState(10);
  const [partCountdown, setPartCountdown] = useState(0); // [breakTime, exerciseTime
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExercise, setCurrentExercise] = useState("");
  const [totalTime, setTotalTime] = useState(0);
  const [totalCountdown, setTotalCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [advancement, setAdvancement] = useState(0);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false); // [true, false
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false); // [true, false

  // User-defined values
  const [userRounds, setUserRounds] = useState(2);
  const [userBreakTime, setUserBreakTime] = useState(5);
  const [userExerciseTime, setUserExerciseTime] = useState(10);

  const beepSoundRef = useRef();




  // Updates countdown when parameters of the workout change
  useEffect(() => {
    setTotalTime((userRounds * userBreakTime) + (userRounds * userExerciseTime));
    setTotalCountdown((userRounds * userBreakTime) + (userRounds * userExerciseTime));
    setPartCountdown(userExerciseTime);
  }, [userRounds, userBreakTime, userExerciseTime]);

  const pauseTimer = () => {
    setIsRunning(!isRunning);
  }

  const handleStart = () => {
    if (isWorkoutFinished) {
      handleReset();
    } else {
      setIsRunning(true)
    }
  };

  // generate a random exercise
  const generateExercise = () => {
    const randomIndex = Math.floor(Math.random() * exerciseList.length);
    setCurrentExercise(exerciseList[randomIndex]);
  };

  useEffect(() => {
    if (isBreakTime) {
      generateExercise();
    }
  }, [isBreakTime]);

  // if setIsBreakTime then partCountdown = breakTime
  useEffect(() => {
    if (isBreakTime) {
      setPartCountdown(userBreakTime);
    } else {
      setPartCountdown(userExerciseTime);
    }
  }, [isBreakTime, userBreakTime, userExerciseTime]);

  // Changes when first starting the workout
  useEffect(() => {
    let timer;

    if (isRunning) {
      setIsWorkoutStarted(true);
      timer = setTimeout(() => {
        setPartCountdown((prevCountdown) => {
          // Play the sound in the last 3 seconds
          if (prevCountdown <= 3 && prevCountdown > 0) {
            beepSoundRef.current.play();
          }
          return prevCountdown - 1;
        });
        setTotalCountdown((prevCountdown) => prevCountdown - 1);
        setAdvancement(Math.floor(((totalTime - (totalCountdown - 1)) / totalTime) * 100));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isRunning && totalCountdown === totalTime) {
      setIsWorkoutFinished(false);
    }
  }, [isRunning, totalCountdown, totalTime]);




  // Updates when partCountdown reaches 0
  useEffect(() => {

    if (partCountdown === 0) {
      if (isBreakTime) {
        setIsBreakTime(false);
        setPartCountdown(userBreakTime);

      } else {
        setIsBreakTime(true);
        setPartCountdown(userExerciseTime);
        if (currentRound < userRounds) {
          setCurrentRound((prevRound) => prevRound + 1);
        }
      }
    }
  }, [partCountdown, isBreakTime, userBreakTime, userRounds, currentRound, userExerciseTime]);

  useEffect(() => {
    if (!isWorkoutStarted) {
      setCurrentRound(1);
    }
  }, [isWorkoutStarted]);

  // end of workout
  useEffect(() => {
    if (totalCountdown === 0) {
      setIsWorkoutFinished(true);
      setIsRunning(false);
    }
  }, [totalCountdown]);

  const handleReset = () => {
    setRounds(userRounds);
    setBreakTime(userBreakTime);
    setExerciseTime(userExerciseTime);
    setCurrentRound(1);
    setCurrentExercise(generateExercise);
    setIsRunning(false);
    setAdvancement(0);
    setIsWorkoutStarted(false);
    setIsWorkoutFinished(false);
    setIsBreakTime(true);
    setTotalCountdown(totalTime);

    if (isBreakTime) {
      setPartCountdown(userBreakTime);
    } else {
      setPartCountdown(userExerciseTime);
    }
  };

  return (
    <div className="container mt-5">

      <audio preload="auto" id="beepSound" ref={beepSoundRef} onPlay={() => console.log("Le son est joué !")} >
        <source src="./sound/beep.wav" type="audio/wav" />
      </audio>

      <div className="row mb-4">
        <div className="col text-center bg-dark text-light">
          <h1 className="display-3">HIIT App</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">Number of Rounds</span>
            <input
              type="number"
              value={userRounds}
              onChange={(e) => setUserRounds(e.target.value)}
              disabled={isWorkoutStarted}
              className="form-control"
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">Break Time</span>
            <input
              type="number"
              value={userBreakTime}
              onChange={(e) => setUserBreakTime(e.target.value)}
              disabled={isWorkoutStarted}
              className="form-control"
            />
          </div>
        </div>

        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">Exercise Time</span>
            <input
              type="number"
              value={userExerciseTime}
              onChange={(e) => setUserExerciseTime(e.target.value)}
              disabled={isWorkoutStarted}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="row mb-4">

        <div className="col-md-6 mx-auto">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h2 className="card-title">{partCountdown}</h2>
              <p className="card-text">{totalCountdown} seconds ({advancement}%) </p>

              <h3 className={isBreakTime ? "text-center text-success" : "text-center text-danger"}>{isBreakTime ? "Rest" : "Workout"}</h3>

              <h4>Round {currentRound} out of {userRounds} rounds</h4>
              {isBreakTime && <h5 className="card-subtitle mb-2 text-muted">Next exercise: {currentExercise}</h5>}
              {!isBreakTime && (
                <h5 className="card-subtitle mb-2 text-warning">
                  {currentExercise.toUpperCase()}
                </h5>
              )}

              {!isWorkoutFinished && !isWorkoutStarted && (
                <button
                  onClick={handleStart}
                  disabled={isWorkoutFinished}
                  className="btn btn-primary btn-lg btn-block mt-3"
                >
                  Start
                </button>
              )}
              {!isWorkoutFinished && isWorkoutStarted && (
                <button onClick={pauseTimer} className="btn btn-warning btn-lg btn-block mt-3">
                  {isRunning ? "Pause" : "Resume"}
                </button>
              )}
              <button onClick={handleReset} className="btn btn-danger btn-lg btn-block mt-3">
                Reset
              </button>

              {isWorkoutFinished && (
                <div className="alert alert-success mt-3">
                  Well done, the workout is finished!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;