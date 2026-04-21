import { test, expect } from '@playwright/test';

test('ทดสอบหน้า Appointments ด้วย API Mocking', async ({ page }) => {
  const useMock = process.env.USE_MOCK === 'true';

  if (useMock) {
    await page.route(`${process.env.NEXT_PUBLIC_API_URL}/appointments`, route => {
      const mockAppointments = [
        { id: 1, fullName: 'Alice', phone: '0812345678', appointmentDate: '2026-04-20', appointmentTime: '10:00' },
        { id: 2, fullName: 'Bob', phone: '0898765432', appointmentDate: '2026-04-21', appointmentTime: '11:00' }
      ]
      route.fulfill({ json: mockAppointments })
    })
  }

  await page.goto(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/appointments`);

  // ตรวจสอบ table มีข้อมูล mock
  await expect(page.locator('table')).toHaveText(/Alice/, { timeout: 10000 });
  await expect(page.locator('table')).toHaveText(/Bob/);

  // ทดสอบ search
  const searchInput = page.getByPlaceholder('ค้นหาชื่อ หรือ เบอร์โทร...');
  await searchInput.fill('Alice');
  await expect(page.locator('table')).toHaveText(/Alice/);
  await expect(page.locator('table')).not.toHaveText(/Bob/);

  // ตรวจสอบ UI elements
  const addButton = page.getByRole('button', { name: /\+ เพิ่มข้อมูลใหม่/ });
  await expect(addButton).toBeVisible();
});