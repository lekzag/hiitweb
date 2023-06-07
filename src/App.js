import React, { useState, useEffect, createRef, useRef } from "react";
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

  const beepSoundRef = useRef(null);
  const audioRef = useRef(null);


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
        setPartCountdown((prevCountdown) => prevCountdown - 1);
        setTotalCountdown((prevCountdown) => prevCountdown - 1);
        setAdvancement(Math.floor(((totalTime - (totalCountdown - 1)) / totalTime) * 100));

        if (partCountdown <= 3 && !beepSoundRef.current.paused) {
          beepSoundRef.current.play();
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isRunning && totalCountdown === totalTime) {
      setIsWorkoutFinished(false);
    }
  }, [isRunning, totalCountdown, totalTime, partCountdown]);


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


    <div className="container">
      <audio preload="auto" id="beepSound" ref={beepSoundRef} onPlay={() => console.log("Le son est joué !")} >
        <source src="./sound/beep.wav" type="audio/wav" />
      </audio>

      <h1 className="mt-5">HIIT App</h1>

      <div className="row mt-4">
        <div className="col-md-4">
          <label>Number of Rounds:</label>
          <input
            type="number"
            value={userRounds}
            onChange={(e) => setUserRounds(e.target.value)}
            disabled={isWorkoutStarted}
            className="form-control"
          />
        </div>

        <div className="col-md-4">
          <label className="text-lg font-semibold">Break Time:</label>
          <input
            type="number"
            value={userBreakTime}
            onChange={(e) => setUserBreakTime(e.target.value)}
            disabled={isWorkoutStarted}
            className="form-control"
          />
        </div>

        <div className="col-md-4">
          <label className="text-lg font-semibold">Exercise Time:</label>
          <input
            type="number"
            value={userExerciseTime}
            onChange={(e) => setUserExerciseTime(e.target.value)}
            disabled={isWorkoutStarted}
            className="form-control"
          />
        </div>
      </div>

      <div className="row mt-4 text-center">

        <div className="col-md-6">
          <div className="text-center">
            <h2>{partCountdown}</h2>
            <p>{totalCountdown} seconds ({advancement}%) </p>
          </div>

          <div className="text-center bg-secondary">
            {isBreakTime ? (
              <h3 className="text-center">Rest</h3>
            ) : (
              <h3 className="text-center text-danger">Workout</h3>
            )}
          </div>


          <div className="text-center">
            <h3>Round {currentRound}</h3>
            <h4> out of {userRounds} rounds</h4>
            {isBreakTime && <h2 className="bg-warning">Next exercice <div>{currentExercise}</div> </h2>}
            {!isBreakTime && (
              <h2 className="alert text-white bg-dark">
                {currentExercise.toUpperCase()}
              </h2>
            )}


          </div>



          {!isWorkoutFinished && !isWorkoutStarted && (
            <button
              onClick={handleStart}
              disabled={isWorkoutFinished}
              className="btn btn-primary"
            >
              Start
            </button>
          )}
          {!isWorkoutFinished && isWorkoutStarted && (
            <button onClick={pauseTimer} className="btn btn-primary">
              {isRunning ? "Pause" : "resume"}
            </button>
          )}
          <button onClick={handleReset} className="btn btn-danger">
            Reset
          </button>
        </div>
      </div>

      <div className="row mt-4">

        <div className="col-md-6">
          {isWorkoutFinished && (
            <div className="alert alert-success">
              Well done, the workout is finished!
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default App;
