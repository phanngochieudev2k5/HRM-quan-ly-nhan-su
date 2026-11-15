import sys
import os
import json
import face_recognition

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Thiếu đường dẫn ảnh"}))
        return

    new_img_path = sys.argv[1]
    exclude_code = sys.argv[2].strip().lower() if len(sys.argv) > 2 and sys.argv[2] else ""

    if not os.path.exists(new_img_path):
        print(json.dumps({"success": False, "message": "File ảnh không tồn tại"}))
        return

    try:
        new_img = face_recognition.load_image_file(new_img_path)
        new_locs = face_recognition.face_locations(new_img)
        if not new_locs:
            new_locs = face_recognition.face_locations(new_img, number_of_times_to_upsample=1)
        new_encs = face_recognition.face_encodings(new_img, new_locs)
    except Exception as ex:
        print(json.dumps({"success": False, "message": "Không thể xử lý ảnh: " + str(ex)}))
        return

    if not new_encs or len(new_encs) == 0:
        print(json.dumps({
            "success": False,
            "noFace": True,
            "message": "Không phát hiện khuôn mặt nào trong ảnh tải lên. Vui lòng chọn ảnh chân dung rõ mặt."
        }))
        return

    target_enc = new_encs[0]

    check_dirs = [
        os.path.abspath("faces"),
        os.path.abspath(os.path.join("backend", "uploads", "faces")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "faces")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "faces"))
    ]

    known_encs = []
    known_codes = []
    scanned_files = set()

    clean_exclude = exclude_code.replace("-", "").replace("_", "")

    for d in check_dirs:
        if not (os.path.exists(d) and os.path.isdir(d)):
            continue
        for f in os.listdir(d):
            p = os.path.join(d, f)
            if not os.path.isfile(p):
                continue
            f_lower = f.lower()
            if not f_lower.endswith((".jpg", ".jpeg", ".png")):
                continue
            if f_lower.startswith("temp_") or f_lower in scanned_files:
                continue

            base_name = os.path.splitext(f_lower)[0]
            clean_name = base_name.split('_')[0].split('-')[0]
            clean_cmp = clean_name.replace("-", "").replace("_", "")

            if clean_exclude and (clean_cmp == clean_exclude or clean_name == exclude_code):
                continue

            scanned_files.add(f_lower)

            try:
                im = face_recognition.load_image_file(p)
                locs = face_recognition.face_locations(im)
                if not locs:
                    locs = face_recognition.face_locations(im, number_of_times_to_upsample=1)
                enc = face_recognition.face_encodings(im, locs)
                if enc and len(enc) > 0:
                    known_encs.append(enc[0])
                    known_codes.append(clean_name)
            except Exception:
                pass

    if len(known_encs) == 0:
        print(json.dumps({
            "success": True,
            "isDuplicate": False,
            "message": "Hợp lệ (chưa có khuôn mặt khác để đối chiếu)"
        }))
        return

    distances = face_recognition.face_distance(known_encs, target_enc)
    if len(distances) == 0:
        print(json.dumps({"success": True, "isDuplicate": False}))
        return

    min_idx = distances.argmin()
    min_dist = float(distances[min_idx])
    matched_code = known_codes[min_idx]

    if min_dist < 0.40:
        similarity_pct = int(round((1.0 - min_dist) * 100))
        print(json.dumps({
            "success": False,
            "isDuplicate": True,
            "matchedCode": matched_code,
            "distance": min_dist,
            "similarity": similarity_pct,
            "message": f"Phát hiện khuôn mặt trùng khớp với mã nhân sự {matched_code.upper()} (độ tương đồng {similarity_pct}%, khoảng cách {min_dist:.2f})"
        }))
        return

    print(json.dumps({
        "success": True,
        "isDuplicate": False,
        "minDistance": min_dist
    }))

if __name__ == "__main__":
    main()
