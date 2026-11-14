import face_recognition
import os
import sys
import json

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Thiếu đường dẫn ảnh"}))
        return

    img_path = sys.argv[1]
    if not os.path.exists(img_path):
        print(json.dumps({"success": False, "message": "File ảnh không tồn tại"}))
        return

    check_dirs = [
        os.path.abspath("faces"),
        os.path.abspath(os.path.join("backend", "uploads", "faces")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "faces")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "faces"))
    ]

    known_encs = []
    known_names = []
    scanned_files = set()

    for d in check_dirs:
        if os.path.exists(d) and os.path.isdir(d):
            for f in os.listdir(d):
                p = os.path.join(d, f)
                if os.path.isfile(p) and f.lower().endswith((".jpg", ".jpeg", ".png")):
                    file_key = os.path.basename(f).lower()
                    if file_key in scanned_files or file_key.startswith("temp_"):
                        continue
                    scanned_files.add(file_key)
                    try:
                        im = face_recognition.load_image_file(p)
                        enc = face_recognition.face_encodings(im)
                        if not enc or len(enc) == 0:
                            locs = face_recognition.face_locations(im, number_of_times_to_upsample=1)
                            enc = face_recognition.face_encodings(im, locs)
                        if enc and len(enc) > 0:
                            known_encs.append(enc[0])
                            base_name = os.path.splitext(f)[0]
                            clean_name = base_name.split('_')[0]
                            known_names.append(clean_name)
                    except Exception:
                        pass

    if len(known_encs) == 0:
        print(json.dumps({"success": False, "message": "Chưa có dữ liệu khuôn mặt nào được đăng ký trong thư mục faces"}))
        return

    try:
        frame_img = face_recognition.load_image_file(img_path)
        frame_encs = face_recognition.face_encodings(frame_img)
        if not frame_encs or len(frame_encs) == 0:
            locs = face_recognition.face_locations(frame_img, number_of_times_to_upsample=1)
            frame_encs = face_recognition.face_encodings(frame_img, locs)
    except Exception as ex:
        print(json.dumps({"success": False, "message": "Lỗi đọc ảnh: " + str(ex)}))
        return

    if not frame_encs or len(frame_encs) == 0:
        print(json.dumps({"success": False, "message": "Không phát hiện khuôn mặt nào trong ảnh"}))
        return

    ds = face_recognition.face_distance(known_encs, frame_encs[0])
    if len(ds) > 0:
        min_idx = ds.argmin()
        min_dist = float(ds[min_idx])
        if min_dist < 0.5:
            matched_name = known_names[min_idx]
            print(json.dumps({"success": True, "name": matched_name, "distance": min_dist}))
            return

    print(json.dumps({"success": False, "message": "Khuôn mặt không khớp với bất kỳ nhân sự nào trong hệ thống"}))

if __name__ == "__main__":
    main()
