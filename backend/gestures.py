import mediapipe as mp
from enum import Enum
from typing import Optional, Any, Callable


##todo: fix thumbs right
##check if we can disable left hand
##futue implementations: turn gestures on and off when user assings them

#========================== GESTURE FUNCTIONS ==========================#
def isOpenPalm(landmarks: Any) -> bool:
    #checks if all fingers are extended aka an open palm
    return all([
    isThumbExtended(landmarks, Finger.Thumb),
    isFingerExtended(landmarks, Finger.Index),
    isFingerExtended(landmarks, Finger.Middle),
    isFingerExtended(landmarks, Finger.Ring),
    isFingerExtended(landmarks, Finger.Pinky),
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

def isThumbsLeft(landmarks: Any) -> bool:
    # all other fingers folded, thumb extended and pointing up
    return all([
        isFingerFolded(landmarks, Finger.Index),
        isFingerFolded(landmarks, Finger.Middle),
        isFingerFolded(landmarks, Finger.Ring),
        isFingerFolded(landmarks, Finger.Pinky),
        isThumbExtended(landmarks, Finger.Thumb),
        isThumbLeft(landmarks, Finger.Thumb),
    ])

def isThumbsRight(landmarks: Any) -> bool:
    # all other fingers folded, thumb extended and pointing down
    return all([
        isFingerFolded(landmarks, Finger.Index),
        isFingerFolded(landmarks, Finger.Middle),
        isFingerFolded(landmarks, Finger.Ring),
        isFingerFolded(landmarks, Finger.Pinky),
        #isThumbExtended(landmarks, Finger.Thumb),
        isThumbFolded(landmarks, Finger.Thumb),
    ])

#========================== GLOBAL VARIABLES ==========================#

lastFiredGesture = None

#mediapipe landmark numbers to fingers
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
    "peace": 0,
    "rock":0,
    "thumbs_right":0,
    "thumbs_left":0,
}

STATIC_GESTURES: list[tuple[str, Callable[[Any], bool], bool]] = [
    ("open_palm", isOpenPalm, True),
    ("peace",     isPeace, True),
    ("rock",      isRock, True),
    ("thumbs_right", isThumbsRight, False),
    ("thumbs_left", isThumbsLeft, False),
]

PERSISTENCE = 20
THUMBSIDE = 0.05

#========================== HELPER FUNCTIONS ==========================#
#add epsilon threshold in the future for edge cases

#for most of this we just compare the x or y position of the finger tip compared to its joint
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

def isThumbLeft(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    mcp = landmarks.landmark[finger.pipIndex]
    return tip.x > mcp.x + THUMBSIDE

def isThumbRight(landmarks, finger: Finger) -> bool:
    tip = landmarks.landmark[finger.tipIndex]
    mcp = landmarks.landmark[finger.pipIndex]
    return tip.x > mcp.x

#check the persistance of a gesture, for every frame that the gesture is detected increase its persistance until it reaches the required value
def checkPersistence(label) -> bool:
    #when persistence value is reached fire the gesture and reset the counter
    if(persistenceCounters[label] == PERSISTENCE):
        persistenceCounters[label] = 0
        return True
    persistenceCounters[label]+=1
    return False

#reset the persistence counter and LFG
def resetCounters():
    global lastFiredGesture
    for gestureName in persistenceCounters:
        persistenceCounters[gestureName] = 0
    lastFiredGesture = None

#========================== MAIN FUNCTION ==========================#

def detectGesture(landmarks: Any) -> Optional[str]:
    global lastFiredGesture
    for label, test_fn, bounce in STATIC_GESTURES:
        if not test_fn(landmarks):
            continue
         
        if not checkPersistence(label):
            return None
        #bounce is for gestures that we want to keep firing as long as we keep them in the camera
        if not bounce:
            return label
        #if we keep a bounce gesture in the camera dont fire it since the user hasnt put their hand back
        if lastFiredGesture == label:
            return None
        
        lastFiredGesture = label
        return label

    # no match this frame → reset all counters
    resetCounters()
    return None
