import express from 'express';
import { AttendanceController } from '../Controllers/AttendanceController.js';
import { faceUpload } from '../Utils/UploadHelper.js';

const router = express.Router();

router.post('/checkin', AttendanceController.checkIn);
router.post('/recognize-frame', AttendanceController.recognizeAndCheckIn);
router.get('/today-events', AttendanceController.getTodayEvents);
router.get('/matrix', AttendanceController.getMonthMatrix);
router.get('/my-attendance', AttendanceController.getMyAttendance);
router.post('/register-face', faceUpload.any(), AttendanceController.registerFace);
router.post('/request-face-photo', AttendanceController.requestFacePhoto);
router.get('/pending-face-request', AttendanceController.getPendingFaceRequest);
router.post('/launch-opencv', AttendanceController.launchOpenCv);
router.post('/stop-opencv', AttendanceController.stopOpenCv);

export default router;
