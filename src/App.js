import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.css";
import exerciseList from './exerciseList';

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
  const [userRounds, setUserRounds] = useState(10);
  const [userBreakTime, setUserBreakTime] = useState(10);
  const [userExerciseTime, setUserExerciseTime] = useState(30);

  const beepSoundRef = useRef();

  const [activeExercises, setActiveExercises] = useState([]);

  const [activeDifficulty, setActiveDifficulty] = useState({
    easy: true,
    medium: true,
    hard: true,
    extreme: false
  });

  const [activeImpact, setActiveImpact] = useState(false);

  const [activeBodyParts, setActiveBodyParts] = useState({
    legs: true,
    upperBody: true,
    fullBody: true,
    abs: true,
    arms: true
  });

  const [isSelectionLocked, setIsSelectionLocked] = useState(false);


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
      setIsSelectionLocked(true);
    }
  };

  const handleValidateSelection = () => {
    setIsSelectionLocked(true);
    generateExercise();
  };

  // generate a random exercise
  const generateExercise = () => {
    const filteredExercises = exerciseList.filter((exercise) => {
      const isDifficultyActive = activeDifficulty[exercise.difficulty];
      const isImpactActive = !exercise.dynamic || activeImpact;
      const isBodyPartActive =
        (activeBodyParts.legs && exercise.bodyPart.includes('legs')) ||
        (activeBodyParts.upperBody && exercise.bodyPart.includes('upper body')) ||
        (activeBodyParts.fullBody && exercise.bodyPart.includes('full body')) ||
        (activeBodyParts.abs && exercise.bodyPart.includes('abs')) ||
        (activeBodyParts.arms && exercise.bodyPart.includes('arms'));

      return isDifficultyActive && isImpactActive && isBodyPartActive;
    });

    const randomIndex = Math.floor(Math.random() * filteredExercises.length);
    setCurrentExercise(filteredExercises[randomIndex].name);
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
          if (prevCountdown <= 4 && prevCountdown > 0) {
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
    setIsSelectionLocked(false);

    if (isBreakTime) {
      setPartCountdown(userBreakTime);
    } else {
      setPartCountdown(userExerciseTime);
    }
  };

  return (
    <div className="container mt-5">

      <audio preload="auto" id="beepSound" ref={beepSoundRef} onPlay={() => console.log("Le son est joué !")} >
        <source src="./sound/1942.mp3" type="audio/mp3" />
      </audio>

      <div className="row mb-4">
        <div className="col text-center bg-dark text-light">
          <h1 className="display-3">HIIT App</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text" style={{ minWidth: "200px" }}>Number of Rounds</span>
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
            <span className="input-group-text" style={{ minWidth: "200px" }}>Break Time</span>
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
            <span className="input-group-text" style={{ minWidth: "200px" }}>Exercise Time</span>
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
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Difficulty:</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeDifficulty.easy}
                  onChange={() => setActiveDifficulty({ ...activeDifficulty, easy: !activeDifficulty.easy })}
                disabled={isSelectionLocked}
                />
                <label className="form-check-label">Easy</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeDifficulty.medium}
                  onChange={() => setActiveDifficulty({ ...activeDifficulty, medium: !activeDifficulty.medium })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Medium</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeDifficulty.hard}
                  onChange={() => setActiveDifficulty({ ...activeDifficulty, hard: !activeDifficulty.hard })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Hard</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeDifficulty.extreme}
                  onChange={() => setActiveDifficulty({ ...activeDifficulty, extreme: !activeDifficulty.extreme })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Extreme</label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Body Parts:</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeBodyParts.legs}
                  onChange={() => setActiveBodyParts({ ...activeBodyParts, legs: !activeBodyParts.legs })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Legs</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeBodyParts.upperBody}
                  onChange={() => setActiveBodyParts({ ...activeBodyParts, upperBody: !activeBodyParts.upperBody })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Upper Body</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeBodyParts.fullBody}
                  onChange={() => setActiveBodyParts({ ...activeBodyParts, fullBody: !activeBodyParts.fullBody })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Full Body</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeBodyParts.abs}
                  onChange={() => setActiveBodyParts({ ...activeBodyParts, abs: !activeBodyParts.abs })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Abs</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeBodyParts.arms}
                  onChange={() => setActiveBodyParts({ ...activeBodyParts, arms: !activeBodyParts.arms })}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Arms</label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Impact:</h5>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={activeImpact}
                  onChange={() => setActiveImpact(!activeImpact)}
                  disabled={isSelectionLocked}
                />
                <label className="form-check-label">Low Impact</label>
              </div>
            </div>
          </div>
        </div>

        {!isSelectionLocked && (
          <button
            onClick={handleValidateSelection}
            className="btn btn-success btn-lg btn-block mt-3"
          >
            Validate Selection
          </button>
        )}

      </div>
      <div className="row mb-4">

        <div className="col-md-6 mx-auto">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h2 className="card-title">{partCountdown}</h2>
              <p>
              Remaining time: {Math.floor(totalCountdown / 60)}:{totalCountdown % 60} ({advancement}%)
              </p>
              <div className="progress mt-3">
                <div className="progress-bar" role="progressbar" style={{ width: `${advancement}%` }}></div>
              </div>


              <h3 className={isBreakTime ? "text-center text-success" : "text-center text-danger"}>{isBreakTime ? "Rest" : "Workout"}</h3>

              <h4>Round {currentRound} out of {userRounds}</h4>
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
