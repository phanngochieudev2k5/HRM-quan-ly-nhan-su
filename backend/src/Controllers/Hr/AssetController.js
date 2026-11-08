import { AssetModel } from '../../Models/AssetModel.js';
import { sendSuccess, sendError } from '../../Utils/ResponseHelper.js';

export class AssetController {
  static async getAssets(req, res) {
    try {
      const { search, category, status, employeeId } = req.query;
      const list = await AssetModel.getAll({ search, category, status, employeeId });
      return sendSuccess(res, list, 'Lấy danh sách tài sản thiết bị thành công!');
    } catch (error) {
      console.error('[AssetController.getAssets] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async getMyAssets(req, res) {
    try {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        return sendSuccess(res, [], 'Chưa có thông tin nhân viên liên kết!');
      }
      const list = await AssetModel.getByEmployeeId(employeeId);
      return sendSuccess(res, list, 'Lấy danh sách thiết bị được cấp thành công!');
    } catch (error) {
      console.error('[AssetController.getMyAssets] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async createAsset(req, res) {
    try {
      const { AssetName } = req.body;
      if (!AssetName || !AssetName.trim()) {
        return sendError(res, 'Vui lòng nhập tên tài sản/thiết bị!', 400);
      }
      const item = await AssetModel.create(req.body);
      return sendSuccess(res, item, 'Cấp phát tài sản thiết bị thành công!', 201);
    } catch (error) {
      console.error('[AssetController.createAsset] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }

  static async deleteAsset(req, res) {
    try {
      const { id } = req.params;
      const result = await AssetModel.delete(id);
      return sendSuccess(res, result, 'Xóa tài sản thiết bị thành công!');
    } catch (error) {
      console.error('[AssetController.deleteAsset] Error:', error);
      return sendError(res, error.message, 500, error);
    }
  }
}

