import mediapipe as mp
from enum import Enum
from typing import Optional

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


def detectGestures(landmarks: mp.framework.formats.landmark_pb2.NormalizedLandmarkList) -> Optional[str]:
    #remember to keep dynamic ones first in the list
    gestures = [("swipe left",isSwipeLeft),("swipe right",isSwipeRight), ("open palm",isOpenPalm), ("fist",isFist)]
    #iterate over gestures returning the detected one
    for label, func in gestures:
        if func(landmarks):
            return label
    return None


def isSwipeLeft(landmarks: mp.framework.formats.landmark_pb2.NormalizedLandmarkList) -> bool:
    return True

def isSwipeRight(landmarks: mp.framework.formats.landmark_pb2.NormalizedLandmarkList) -> bool:
    return True

def isOpenPalm(landmarks: mp.framework.formats.landmark_pb2.NormalizedLandmarkList) -> bool:
    #checks if all fingers are extended aka an open palm
    return all([
    isFingerExtended(landmarks, Finger.Thumb),
    isFingerExtended(landmarks, Finger.Index),
    isFingerExtended(landmarks, Finger.Middle),
    isFingerExtended(landmarks, Finger.Ring),
    isFingerExtended(landmarks, Finger.Pinky),
    ])

def isFist(landmarks: mp.framework.formats.landmark_pb2.NormalizedLandmarkList) -> bool:
    #checks if all finders are folded aka fist
    return all([
    isFingerFolded(landmarks, Finger.Thumb),
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