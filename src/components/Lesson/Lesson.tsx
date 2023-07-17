import { FunctionComponent, useReducer } from "react";
import { styled } from "styled-components";

// TODO get rid of relative import for components
import { Challenge, ChallengeProps } from "../Challenge/Challenge";

import { Button, Typography } from "@mui/material";
import {useState} from 'react';

export interface LessonProps {
    no: number;
    challenges: ChallengeProps[];
}

const LessonHeader = styled.div`
    background-color: var(--primary-accent);
    color: #ffffff;
    margin-bottom: 20px;
    padding: 20px 40px;
    display: flex;
`;

const LessonBody = styled.div`
    padding: 0 40px;
    margin-bottom: 20px;
`;

const LessonFooter = styled.div`
    padding: 0 40px;
`;

enum LessonChallengeStatus {
    PROGRESS,
    COMPLETE
}

interface LessonState {
    challengeNumber: number;
    challengeStatus: LessonChallengeStatus,
    complete: boolean;
    correct: number;
    incorrect: number;
}

enum LessonActionType {
    COMPLETE_LESSON,
    COMPLETE_CHALLENGE,
    SHOW_NEXT_CHALLENGE
}

interface LessonAction {
    type: LessonActionType,
    data?: {
        solved: boolean,
    }
}

function lessonStateReducer(state: LessonState, {type, data}: LessonAction): LessonState {
    if (type === LessonActionType.COMPLETE_LESSON) {
        return {
            ...state,
            complete: true
        };
    } else if (type === LessonActionType.COMPLETE_CHALLENGE) {
        const updatedState: Partial<LessonState> = {};

        if (data?.solved) {
            updatedState.correct = state.correct + 1;
        } else {
            updatedState.incorrect = state.incorrect + 1;
        }

        return {
            ...state,
            ...updatedState,
            challengeStatus: LessonChallengeStatus.COMPLETE
        };
    } else if (type === LessonActionType.SHOW_NEXT_CHALLENGE) {
        return {
            ...state,
            challengeNumber: state.challengeNumber + 1,
            challengeStatus: LessonChallengeStatus.PROGRESS
        };
    }

    return state;
}

export const Lesson: FunctionComponent<LessonProps> = ({ challenges, no }) => {
    const [showChallenge, setShowChallenge] = useState(true);

    const [state, dispatch] = useReducer(lessonStateReducer, {
        challengeNumber: 0,
        challengeStatus: LessonChallengeStatus.PROGRESS,
        complete: false,   
        correct: 0,
        incorrect: 0
    });

    function onChallengeComplete(data: LessonAction['data']) {
        // TODO pass in completion status
        dispatch({ type: LessonActionType.COMPLETE_CHALLENGE, data });
    }

    function showNextChallenge() {
        if (state.challengeNumber + 1 === challenges.length) {
            dispatch({ type: LessonActionType.COMPLETE_LESSON });
        } else {
            setShowChallenge(false);
            dispatch({ type: LessonActionType.SHOW_NEXT_CHALLENGE });
            setTimeout(() => {
                setShowChallenge(true);
            }, 20);
        }
    }

    // TODO Lesson complete screen (simple)
    // - Congratulations, you've completed the lesson
    // - Accuracy 100%, 95% etc
    // - Go to lesson list button

    // TODO Disable check button if input is empty

    // IMP Duolingo has a nice slide, fade in animation for changing the challenges

    return (
        <div>
            <LessonHeader>
                <Typography variant="h4">Lesson {no}</Typography>
                <Typography sx={{ marginLeft: 'auto' }} variant="h4">{state.challengeNumber + 1}/{challenges.length}</Typography>
            </LessonHeader>
            <LessonBody>
                {state.complete && <div className="Lesson__complete">
                    <Typography variant="h4">Congratulations</Typography>
                    <Typography variant="h5">You have completed the lesson</Typography>
                    <Typography variant="body1">Correct challenges: {state.correct} / {challenges.length}</Typography>
                </div>}
                {!state.complete && showChallenge && <Challenge {...challenges[state.challengeNumber]} onComplete={onChallengeComplete}/>}
            </LessonBody>
            <LessonFooter>
                {!state.complete && state.challengeStatus === LessonChallengeStatus.COMPLETE && <Button color="success" variant="contained" sx={{ borderRadius: '8px' }} onClick={showNextChallenge}>Continue</Button>}
            </LessonFooter>
        </div>
    );
};
