import cv2
from ultralytics import YOLO
import numpy as np
import torch


def main():
    print("🚀 Starting... [YOLO]!")
    
    cap = cv2.VideoCapture("dogs.mp4")
    model = YOLO("yolov8m.pt")

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        results = model(frame, device="mps")
        result = results[0]
        bboxes = np.array(result.boxes.xyxy.cpu(), dtype="int")
        classes = np.array(result.boxes.cls.cpu(), dtype="int")

        for cls, bbox in zip(classes, bboxes):
            (x, y, x2, y2) = bbox
            cv2.rectangle(frame, (x, y), (x2, y2), (0, 0, 225), 4)
            cv2.putText(frame, model.names[cls], (x, y - 12), cv2.FONT_HERSHEY_PLAIN, 3, (0, 0, 225), 3)

        cv2.imshow("Img", frame)
        key = cv2.waitKey(1)
        if key == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
    print("🫡  Closing... Bye Bye!")


if __name__ == "__main__":
    main()