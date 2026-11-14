import cv2
import face_recognition
import os
import time
import requests

faces_dir = "faces"
if not os.path.exists(faces_dir):
    faces_dir = os.path.join("backend", "uploads", "faces")
if not os.path.exists(faces_dir):
    faces_dir = os.path.join("..", "..", "uploads", "faces")
if not os.path.exists(faces_dir):
    os.makedirs("faces", exist_ok=True)
    faces_dir = "faces"

encs = []
names = []

for f in os.listdir(faces_dir):
    f_path = os.path.join(faces_dir, f)
    if not os.path.isfile(f_path):
        continue
    ext = os.path.splitext(f)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        continue
    try:
        img = face_recognition.load_image_file(f_path)
        e = face_recognition.face_encodings(img)
        if len(e) > 0:
            encs.append(e[0])
            base_name = os.path.splitext(f)[0]
            clean_name = base_name.split('_')[0]
            names.append(clean_name)
    except Exception:
        pass

last_sent = {}
status_display = {}
api_url = "http://localhost:5000/api/attendance/checkin"

cap = None

def init_cam():
    global cap
    try:
        c = cv2.VideoCapture(0)
        if c.isOpened():
            return c
        c.release()
    except Exception:
        pass
    try:
        c = cv2.VideoCapture(1)
        if c.isOpened():
            return c
        c.release()
    except Exception:
        pass
    return None

cap = init_cam()

running = True
consecutive_fails = 0

while running:
    if cap is None or not cap.isOpened():
        consecutive_fails += 1
        if consecutive_fails > 10:
            time.sleep(5)
        else:
            time.sleep(2)
        cap = init_cam()
        continue

    ret, img = cap.read()
    if not ret or img is None:
        consecutive_fails += 1
        if consecutive_fails > 15:
            if cap:
                cap.release()
            cap = None
            consecutive_fails = 0
        time.sleep(0.5)
        continue

    consecutive_fails = 0
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    locs = face_recognition.face_locations(rgb)
    es = face_recognition.face_encodings(rgb, locs)

    current_ts = time.time()

    for e, (top, right, bottom, left) in zip(es, locs):
        ds = face_recognition.face_distance(encs, e)
        name = "Unknown"
        color = (0, 0, 255)

        if len(ds) > 0:
            i = ds.argmin()
            if ds[i] < 0.5:
                name = names[i]
                color = (0, 255, 0)

                if name not in last_sent or (current_ts - last_sent[name]) > 30:
                    last_sent[name] = current_ts
                    try:
                        resp = requests.post(
                            api_url,
                            json={"employeeCode": name, "checkinMethod": "OPENCV_CAMERA", "deviceName": "Kiosk Cam Cổng Chính"},
                            timeout=3
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            action_txt = "VAO" if data.get("action") == "CHECK_IN" else "RA"
                            status_display[name] = (f"{action_txt}: {name} OK", current_ts)
                        else:
                            status_display[name] = (f"{name}: Gui loi", current_ts)
                    except Exception:
                        status_display[name] = (f"{name}: Khong ket noi API", current_ts)

        cv2.rectangle(img, (left, top), (right, bottom), color, 2)
        cv2.putText(img, name, (left, top - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    active_msgs = []
    for k, (msg, t) in list(status_display.items()):
        if current_ts - t < 5.0:
            active_msgs.append(msg)
        else:
            del status_display[k]

    for idx, msg in enumerate(active_msgs):
        cv2.putText(img, msg, (20, 40 + idx * 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    try:
        cv2.imshow("Nhan dien khuon mat - Kiosk Cham Cong OpenCV", img)
        key = cv2.waitKey(1)
        if key == 27:
            running = False
            break
    except Exception:
        time.sleep(0.1)

if cap:
    try:
        cap.release()
    except Exception:
        pass

try:
    cv2.destroyAllWindows()
except Exception:
    pass
