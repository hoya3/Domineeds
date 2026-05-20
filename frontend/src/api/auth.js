import apiClient from './client';

/**
 * 로그인 — OAuth2 form 형식으로 전송
 */
export const loginApi = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email); // 백엔드가 username 필드로 받음
  formData.append('password', password);

  const response = await apiClient.post('/login/access-token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data; // { access_token, token_type }
};

/**
 * 회원가입
 */
export const registerApi = async ({ email, password, full_name, student_id, dorm_name, room_number }) => {
  const response = await apiClient.post('/register', {
    email,
    password,
    full_name,
    student_id,
    dorm_name: dorm_name || null,
    room_number: room_number || null,
  });
  return response.data;
};

/**
 * 현재 로그인한 사용자 정보 조회
 */
export const getUserMe = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
