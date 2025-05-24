import mediapipe as mp
from enum import Enum
from typing import Optional, Any
from collections import deque

#declare frame history buffer
frameHistoryBuffer = deque(maxlen=10) ##10fps for now

lastFiredGesture = None
#declare all fingers as enums
class Finger(Enum):
    Thumb  = (4, 2)
    Index  = (8, 6)
    Middle = (12, 10)
    Ring   = (16, 14)
    Pinky  = (20, 18)

    def __init__(self, tipIndex: int, pipIndex: int):
        self.tipIndex = tipIndex
        self.pipIndex = pipIndex

persistenceCounters = {
    "open_palm": 0,
    "fist": 0,
    "peace": 0,
    "swipe_left":0,
    "swipe_right":0,
    "rock":0,
}

PERSISTENCE = 20
WRIST = 0
SWIPETHRESHOLD = 0.3


def detectGesture(landmarks: Any) -> Optional[str]:
    global lastFiredGesture

    # 1) buffer just the wrist x-coordinate
    frameHistoryBuffer.append(landmarks.landmark[WRIST].x)

    # 2) (label, test_fn, is_dynamic?)
    gestures = [
        ("swipe_left",  isSwipeLeft,  True),
        ("swipe_right", isSwipeRight, True),
        ("open_palm",   isOpenPalm,   False),
        ("fist",        isFist,       False),
        ("peace",       isPeace,      False),
        ("rock",        isRock,       False),
    ]

    for label, test_fn, is_dynamic in gestures:
        if not test_fn(landmarks):
            continue

        # 3) if it's the same as last fired, suppress
        if lastFiredGesture == label:
            return None
        # else, reset so our persistence check starts fresh
        lastFiredGesture = None

        # 4) non-dynamic gestures must pass persistence
        if not is_dynamic and not checkPersistence(label):
            return None

        # 5) we’ve got a new, valid gesture — record it and fire
        lastFiredGesture = label
        return label

    # 6) no gesture matched this frame
    resetCounters()
    return None

def isSwipeRight(landmarks: Any) -> bool:
     #check if buffer if full
    if(len(frameHistoryBuffer) == 10):
        ##check if the wrist is moving left
        diff = frameHistoryBuffer[-1] - frameHistoryBuffer[0]
        if(diff <= -SWIPETHRESHOLD):
            frameHistoryBuffer.clear()
            frameHistoryBuffer.append(landmarks.landmark[WRIST].x)
            return True
    return False

def isSwipeLeft(landmarks: Any) -> bool:
    #check if buffer if full
    if(len(frameHistoryBuffer) == 10):
        ##check if the wrist is moving right
        diff = frameHistoryBuffer[-1] - frameHistoryBuffer[0]
        if(diff >= SWIPETHRESHOLD):
            frameHistoryBuffer.clear()
            frameHistoryBuffer.append(landmarks.landmark[WRIST].x)
            return True
    return False

def isOpenPalm(landmarks: Any) -> bool:
    #checks if all fingers are extended aka an open palm
    return all([
    isThumbExtended(landmarks, Finger.Thumb),
    isFingerExtended(landmarks, Finger.Index),
    isFingerExtended(landmarks, Finger.Middle),
    isFingerExtended(landmarks, Finger.Ring),
    isFingerExtended(landmarks, Finger.Pinky),
    ])

def isFist(landmarks: Any) -> bool:
    #checks if all finders are folded aka fist
    return all([
    isThumbFolded(landmarks, Finger.Thumb),
    isFingerFolded(landmarks, Finger.Index),
    isFingerFolded(landmarks, Finger.Middle),
    isFingerFolded(landmarks, Finger.Ring),
    isFingerFolded(landmarks, Finger.Pinky),
    ])

def isPeace(landmarks: Any)-> bool:
    return all([
        isFingerExtended(landmarks, Finger.Index),
        isFingerExtended(landmarks, Finger.Middle),
        isFingerFolded(landmarks, Finger.Ring),
        isFingerFolded(landmarks, Finger.Pinky),
        isThumbFolded(landmarks, Finger.Thumb),
    ])

def isRock(landmarks: Any)-> bool:
    return all([
        isFingerExtended(landmarks, Finger.Index),
        isFingerFolded(landmarks, Finger.Middle),
        isFingerFolded(landmarks, Finger.Ring),
        isFingerExtended(landmarks, Finger.Pinky),
        isThumbExtended(landmarks, Finger.Thumb),
    ])


#add epsilon threshold in the future for edge cases

def isFingerFolded(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    pip = landmarks.landmark[finger.pipIndex]
    return tip.y > pip.y

def isFingerExtended(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    pip = landmarks.landmark[finger.pipIndex]
    return tip.y < pip.y

def isThumbFolded(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    pip = landmarks.landmark[finger.pipIndex]
    return tip.x < pip.x

def isThumbExtended(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    pip = landmarks.landmark[finger.pipIndex]
    return tip.x > pip.x

def checkPersistence(label) -> bool:
    if(persistenceCounters[label] == PERSISTENCE):
        persistenceCounters[label] = 0
        return True
    persistenceCounters[label]+=1
    return False

def resetCounters():
    global lastFiredGesture
    for gestureName in persistenceCounters:
        persistenceCounters[gestureName] = 0
    lastFiredGesture = None