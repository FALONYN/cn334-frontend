import { test, expect } from '@playwright/test';

test('ทดสอบหน้า Appointments', async ({ page }) => {
  const useMock = process.env.USE_MOCK === 'true';

  // ถ้าใช้ Mock ให้ดักจับ API
  if (useMock) {
    await page.route(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, async route => {
      const mockAppointments = [
        { id: 1, patient_name: 'Alice', date: '2026-04-20', time: '10:00', doctor: 'Dr. Smith' },
        { id: 2, patient_name: 'Bob', date: '2026-04-21', time: '11:00', doctor: 'Dr. John' }
      ];
      await route.fulfill({ json: mockAppointments });
    });
  }

  // ไปที่หน้า Appointments (URL จาก environment variable)
  await page.goto(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/appointments`);

  // ตรวจสอบว่าตารางแสดงข้อมูล (ใช้ mock หรือจริงก็ได้)
  if (useMock) {
    await expect(page.locator('table')).toContainText('Alice');
    await expect(page.locator('table')).toContainText('Bob');
  }

  // ทดสอบระบบค้นหา
  const searchInput = page.getByPlaceholder('ค้นหาชื่อคนไข้ หรือวันที่...');
  await searchInput.fill('Alice');

  await expect(page.locator('table')).toContainText('Alice');
  await expect(page.locator('table')).not.toContainText('Bob');

  // ตรวจสอบ UI Elements
  const addButton = page.getByRole('button', { name: 'เพิ่มนัดหมาย' });
  const detailButtons = page.getByRole('button', { name: /รายละเอียด/ });

  await expect(addButton).toBeVisible();
  await expect(detailButtons.first()).toBeVisible();
});