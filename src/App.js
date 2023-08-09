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
  const bellSoundRef = useRef();

  const [activeDifficulty, setActiveDifficulty] = useState({
    easy: true,
    medium: true,
    hard: true,
    extreme: false
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  const difficultyWeights = {
    easy: { easy: 0.8, medium: 0.2, hard: 0.0, extreme: 0.0 },
    medium: { easy: 0.2, medium: 0.7, hard: 0.1, extreme: 0.0 },
    hard: { easy: 0.1, medium: 0.2, hard: 0.7, extreme: 0.0 },
    extreme: { easy: 0.0, medium: 0.2, hard: 0.3, extreme: 0.5 },
  };

  const [activeImpact, setActiveImpact] = useState(false);

  const [activeBodyParts, setActiveBodyParts] = useState({
    legs: true,
    upperBody: true,
    fullBody: true,
    abs: true,
    arms: true
  });

  const [filteredExercises, setFilteredExercises] = useState([]);

  const [isSelectionLocked, setIsSelectionLocked] = useState(false);
  const [isSelectionValidated, setIsSelectionValidated] = useState(false);


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
    setIsSelectionValidated(true);
    generateExercise();
  };

  // Update filtered exercises whenever the active criteria change
  useEffect(() => {
    const updateFilteredExercises = () => {
      const filteredExercises = exerciseList.filter((exercise) => {
        const isImpactActive = !activeImpact || !exercise.dynamic;
        const isBodyPartActive = exercise.bodyPart.some(part => activeBodyParts[part]);
        const hasNonZeroWeight = difficultyWeights[selectedDifficulty][exercise.difficulty] > 0;
        
        return isImpactActive && isBodyPartActive && hasNonZeroWeight;
      });
    
      setFilteredExercises(filteredExercises);
    };    
  
    updateFilteredExercises();
  }, [activeImpact, activeBodyParts, selectedDifficulty]);// removed selectedDifficulty from the dependencies

  // generate a random exercise
  const generateExercise = () => {
    if (filteredExercises.length > 0) {
      // Filter the exercises by the selected difficulty and then apply the weights
      const filteredByDifficulty = filteredExercises.filter((exercise) => difficultyWeights[selectedDifficulty][exercise.difficulty] > 0);

      const weights = filteredByDifficulty.map(
        (exercise) => difficultyWeights[selectedDifficulty][exercise.difficulty]
      );
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let randomNum = Math.random() * totalWeight;
      let weightSum = 0;
      let selectedExercise;

      for (let i = 0; i < filteredByDifficulty.length; i++) {
        weightSum += weights[i];
        if (randomNum <= weightSum) {
          selectedExercise = filteredByDifficulty[i];
          break;
        }
      }

      setCurrentExercise(selectedExercise.name);
    } else {
      console.log("No exercises found with the current filters");
    }
    console.log("Filtered exercises:", filteredExercises);
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
    if (partCountdown === userExerciseTime && !isBreakTime) {
      bellSoundRef.current.play();
    }
  }, [partCountdown, isBreakTime, userBreakTime, userRounds, currentRound, userExerciseTime, bellSoundRef]);

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
    setIsSelectionValidated(false);

    if (isBreakTime) {
      setPartCountdown(userBreakTime);
    } else {
      setPartCountdown(userExerciseTime);
    }
  };

  return (
    <div className="container mt-5">

      <audio preload="auto" id="beepSound" ref={beepSoundRef} onPlay={() => console.log("Le son beep est joué !")}>
        <source src="./sound/1942.mp3" type="audio/mp3" />
      </audio>

      <audio preload="auto" id="bellSound" ref={bellSoundRef} onPlay={() => console.log("Le son bell est joué !")}>
        <source src="./sound/bell.wav" type="audio/wav" />
      </audio>

      <div className="row mb-4">
        <div className="col text-center bg-dark text-light">
          <h1 className="display-3">HIIT App</h1>
        </div>
      </div>

      {isSelectionValidated ? (
        // Show workout information
        <div className="row mb-4">
          <div className="col-md-6 mx-auto">
            <div className="card text-center bg-light">
              <div className="card-body">
                <h2 className="card-title">{partCountdown}</h2>
                <p>
                  Remaining time : {Math.floor(totalCountdown / 60)}:{totalCountdown % 60} ({advancement}%)
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
      ) : (
        // Show selection
        <div>
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
                <div className="card-header">
                  <h5>Difficulty:</h5>
                </div>
                <div className="card-body">
                  <select
                    className="form-select"
                    value={selectedDifficulty}
                    onChange={e => setSelectedDifficulty(e.target.value)}
                    disabled={isSelectionLocked}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="extreme">Extreme</option>
                  </select>
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

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5>Number of selected exercises :</h5>
                  <div className="col-md-6 mx-auto">
                    {filteredExercises.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
          <div className="col-md-4">
            <button
              onClick={handleValidateSelection}
              className="btn btn-success btn-lg btn-block mt-3"
            >
              Validate Selection
            </button>
          </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;