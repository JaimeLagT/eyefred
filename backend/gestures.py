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
    "swipe_left":0,
    "swipe_right":0,
}

PERSISTENCE = 20
WRIST = 0
SWIPETHRESHOLD = 0.3


def detectGesture(landmarks: Any) -> Optional[str]:
    global lastFiredGesture
    #add the current frame to the buffer
    frameHistoryBuffer.append(landmarks.landmark[WRIST].x)
    #remember to keep dynamic ones first in the list
    gestures = [("swipe_left",isSwipeLeft),("swipe_right",isSwipeRight), ("open_palm",isOpenPalm), ("fist",isFist)]
    #iterate over gestures returning the detected one
    for label, func in gestures:
        ##add pers checker here
        if func(landmarks):
            if  lastFiredGesture == label:
                return None
            else: ##if its not the same just reset it to none 
                lastFiredGesture = None
            if checkPersistence(label):
                lastFiredGesture = label
                return label
            else:
                return None
    #if no gesture is detected, return None and update counters
    resetCounters()
    return None

def isSwipeLeft(landmarks: Any) -> bool:

     #check if buffer if full
    if(len(frameHistoryBuffer) == 10):
        ##check if the wrist is moving left
        diff = frameHistoryBuffer[-1] - frameHistoryBuffer[0]
        if(diff <= -SWIPETHRESHOLD):
            frameHistoryBuffer.clear()
            frameHistoryBuffer.append(landmarks.landmark[WRIST].x)
            return True
    return False

def isSwipeRight(landmarks: Any) -> bool:
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
    isFingerExtended(landmarks, Finger.Thumb),
    isFingerExtended(landmarks, Finger.Index),
    isFingerExtended(landmarks, Finger.Middle),
    isFingerExtended(landmarks, Finger.Ring),
    isFingerExtended(landmarks, Finger.Pinky),
    ])

def isFist(landmarks: Any) -> bool:
    #checks if all finders are folded aka fist
    return all([
    #isFingerFolded(landmarks, Finger.Thumb),
    isFingerFolded(landmarks, Finger.Index),
    isFingerFolded(landmarks, Finger.Middle),
    isFingerFolded(landmarks, Finger.Ring),
    isFingerFolded(landmarks, Finger.Pinky),
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