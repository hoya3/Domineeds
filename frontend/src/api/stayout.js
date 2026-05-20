import apiClient from './client';

/**
 * 외박 신청 생성
 * @param {{ start_date: string, end_date: string, destination: string, reason?: string }} data
 */
export const createStayout = async (data) => {
  const response = await apiClient.post('/stayout/', data);
  return response.data;
};

/**
 * 내 외박 신청 내역 조회
 */
export const getMyStayouts = async () => {
  const response = await apiClient.get('/stayout/me');
  return response.data;
};

/**
 * 외박 신청 취소
 * @param {number} stayoutId
 */
export const cancelStayout = async (stayoutId) => {
  const response = await apiClient.patch(`/stayout/${stayoutId}/cancel`);
  return response.data;
};

/**
 * [관리자] 전체 외박 신청 조회
 */
export const getAllStayouts = async () => {
  const response = await apiClient.get('/stayout/all');
  return response.data;
};
