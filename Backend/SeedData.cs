// ============================================================
// ФАЙЛ: SeedData.cs
// Поместите в папку Backend/ (рядом с Program.cs)
// В Program.cs перед app.Run() добавьте:
//   await SeedData.InitializeAsync(app.Services);
// ============================================================
using Курсовая.Data;
using Курсовая.Models;
using Microsoft.EntityFrameworkCore;

namespace Курсовая
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // --- ПОЛЬЗОВАТЕЛИ ---
            if (!await db.Users.AnyAsync())
            {
                db.Users.AddRange(
                    new User { FullName = "Администратор Системы", Email = "admin@lapaklinik.ru", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "admin" },
                    new User { FullName = "Петров Пётр Петрович", Email = "doctor@lapaklinik.ru", PasswordHash = BCrypt.Net.BCrypt.HashPassword("doctor123"), Role = "doctor" },
                    new User { FullName = "Иванова Мария Сергеевна", Email = "client@lapaklinik.ru", PasswordHash = BCrypt.Net.BCrypt.HashPassword("client123"), Role = "client" }
                );
                await db.SaveChangesAsync();
            }

            // --- ВРАЧИ ---
            if (!await db.Doctors.AnyAsync())
            {
                // Привязываем врача-пользователя к записи в таблице doctors
                var doctorUser = await db.Users.FirstAsync(u => u.Email == "doctor@lapaklinik.ru");

                db.Doctors.AddRange(
                    new Doctor { FullName = "Петров Пётр Петрович", Specialization = "Терапевт", ExperienceYears = 8, Phone = "+7 901 111 22 33", UserId = doctorUser.Id },
                    new Doctor { FullName = "Смирнова Анна Олеговна", Specialization = "Хирург", ExperienceYears = 12, Phone = "+7 902 222 33 44" },
                    new Doctor { FullName = "Козлов Дмитрий Иванович", Specialization = "Дерматолог", ExperienceYears = 5, Phone = "+7 903 333 44 55" },
                    new Doctor { FullName = "Новикова Елена Фёдоровна", Specialization = "Офтальмолог", ExperienceYears = 3, Phone = "+7 904 444 55 66" },
                    new Doctor { FullName = "Волков Сергей Александрович", Specialization = "Кардиолог", ExperienceYears = 15, Phone = "+7 905 555 66 77" }
                );
                await db.SaveChangesAsync();
            }

            // --- УСЛУГИ ---
            if (!await db.Services.AnyAsync())
            {
                db.Services.AddRange(
                    new Service { Name = "Первичный осмотр", Price = 800m, DurationMinutes = 30 },
                    new Service { Name = "Повторный осмотр", Price = 500m, DurationMinutes = 20 },
                    new Service { Name = "Вакцинация", Price = 1200m, DurationMinutes = 20 },
                    new Service { Name = "Стерилизация кошки", Price = 5500m, DurationMinutes = 90 },
                    new Service { Name = "Кастрация кота", Price = 3500m, DurationMinutes = 60 },
                    new Service { Name = "УЗИ брюшной полости", Price = 1800m, DurationMinutes = 30 },
                    new Service { Name = "Анализ крови (общий)", Price = 900m, DurationMinutes = 15 },
                    new Service { Name = "Удаление зубного камня", Price = 3200m, DurationMinutes = 60 },
                    new Service { Name = "Чипирование", Price = 900m, DurationMinutes = 10 },
                    new Service { Name = "Обработка от паразитов", Price = 600m, DurationMinutes = 15 }
                );
                await db.SaveChangesAsync();
            }

            // --- ВЛАДЕЛЬЦЫ ---
            if (!await db.Owners.AnyAsync())
            {
                // Привязываем клиента-пользователя к записи в таблице owners
                var clientUser = await db.Users.FirstAsync(u => u.Email == "client@lapaklinik.ru");

                db.Owners.AddRange(
                    new Owner { FullName = "Иванова Мария Сергеевна", Phone = "+7 916 123 45 67", Email = "ivanova@mail.ru", Address = "г. Москва, ул. Пушкина, д. 10, кв. 5", UserId = clientUser.Id },
                    new Owner { FullName = "Сидоров Алексей Викторович", Phone = "+7 917 234 56 78", Email = "sidorov@gmail.com", Address = "г. Москва, ул. Ленина, д. 22, кв. 14" },
                    new Owner { FullName = "Попова Ольга Николаевна", Phone = "+7 918 345 67 89", Email = "popova@yandex.ru", Address = "г. Подольск, ул. Советская, д. 8" },
                    new Owner { FullName = "Фёдоров Игорь Дмитриевич", Phone = "+7 919 456 78 90", Email = "fedorov@mail.ru", Address = "г. Москва, пр. Мира, д. 55, кв. 3" },
                    new Owner { FullName = "Кузнецова Светлана Павловна", Phone = "+7 920 567 89 01", Email = "kuznetsova@list.ru", Address = "г. Балашиха, ул. Садовая, д. 4" }
                );
                await db.SaveChangesAsync();
            }

            // --- ПИТОМЦЫ ---
            if (!await db.Pets.AnyAsync())
            {
                var o1 = await db.Owners.FirstAsync(o => o.Email == "ivanova@mail.ru");
                var o2 = await db.Owners.FirstAsync(o => o.Email == "sidorov@gmail.com");
                var o3 = await db.Owners.FirstAsync(o => o.Email == "popova@yandex.ru");
                var o4 = await db.Owners.FirstAsync(o => o.Email == "fedorov@mail.ru");
                var o5 = await db.Owners.FirstAsync(o => o.Email == "kuznetsova@list.ru");

                db.Pets.AddRange(
                    new Pet { OwnerId = o1.Id, Name = "Барсик", AnimalType = "Кошка", Breed = "Сибирская", Gender = "Мужской", BirthDate = new DateOnly(2020, 3, 15) },
                    new Pet { OwnerId = o1.Id, Name = "Муся", AnimalType = "Кошка", Breed = "Шотландская вислоухая", Gender = "Женский", BirthDate = new DateOnly(2021, 7, 22) },
                    new Pet { OwnerId = o2.Id, Name = "Рекс", AnimalType = "Собака", Breed = "Немецкая овчарка", Gender = "Мужской", BirthDate = new DateOnly(2019, 11, 5) },
                    new Pet { OwnerId = o2.Id, Name = "Белка", AnimalType = "Собака", Breed = "Лабрадор", Gender = "Женский", BirthDate = new DateOnly(2022, 1, 10) },
                    new Pet { OwnerId = o3.Id, Name = "Кеша", AnimalType = "Попугай", Breed = "Волнистый", Gender = "Мужской", BirthDate = new DateOnly(2021, 5, 30) },
                    new Pet { OwnerId = o4.Id, Name = "Дружок", AnimalType = "Собака", Breed = "Двортерьер", Gender = "Мужской", BirthDate = new DateOnly(2018, 8, 12) },
                    new Pet { OwnerId = o4.Id, Name = "Рыжик", AnimalType = "Кошка", Breed = "Мейн-кун", Gender = "Мужской", BirthDate = new DateOnly(2023, 2, 28) },
                    new Pet { OwnerId = o5.Id, Name = "Снежинка", AnimalType = "Кошка", Breed = "Персидская", Gender = "Женский", BirthDate = new DateOnly(2020, 12, 1) }
                );
                await db.SaveChangesAsync();
            }

            // --- ПРИЁМЫ ---
            if (!await db.Appointments.AnyAsync())
            {
                var pBarsik = await db.Pets.FirstAsync(p => p.Name == "Барсик");
                var pMusya = await db.Pets.FirstAsync(p => p.Name == "Муся");
                var pRex = await db.Pets.FirstAsync(p => p.Name == "Рекс");
                var pBelka = await db.Pets.FirstAsync(p => p.Name == "Белка");
                var pKesha = await db.Pets.FirstAsync(p => p.Name == "Кеша");
                var pDruzhok = await db.Pets.FirstAsync(p => p.Name == "Дружок");
                var pRizhik = await db.Pets.FirstAsync(p => p.Name == "Рыжик");

                var dPetrov = await db.Doctors.FirstAsync(d => d.FullName == "Петров Пётр Петрович");
                var dSmirnova = await db.Doctors.FirstAsync(d => d.FullName == "Смирнова Анна Олеговна");
                var dKozlov = await db.Doctors.FirstAsync(d => d.FullName == "Козлов Дмитрий Иванович");
                var dNovikova = await db.Doctors.FirstAsync(d => d.FullName == "Новикова Елена Фёдоровна");

                var sOsmotr = await db.Services.FirstAsync(s => s.Name == "Первичный осмотр");
                var sVakts = await db.Services.FirstAsync(s => s.Name == "Вакцинация");
                var sUZI = await db.Services.FirstAsync(s => s.Name == "УЗИ брюшной полости");
                var sSteril = await db.Services.FirstAsync(s => s.Name == "Стерилизация кошки");
                var sKrov = await db.Services.FirstAsync(s => s.Name == "Анализ крови (общий)");
                var sChip = await db.Services.FirstAsync(s => s.Name == "Чипирование");
                var sParaz = await db.Services.FirstAsync(s => s.Name == "Обработка от паразитов");

                db.Appointments.AddRange(
                    new Appointment { PetId = pBarsik.Id, DoctorId = dPetrov.Id, ServiceId = sOsmotr.Id, AppointmentDatetime = new DateTime(2026, 5, 10, 10, 0, 0), Status = "completed", Notes = "Профилактический осмотр. Животное здорово." },
                    new Appointment { PetId = pBarsik.Id, DoctorId = dPetrov.Id, ServiceId = sVakts.Id, AppointmentDatetime = new DateTime(2026, 5, 10, 10, 30, 0), Status = "completed", Notes = "Комплексная вакцинация. Побочных реакций нет." },
                    new Appointment { PetId = pMusya.Id, DoctorId = dSmirnova.Id, ServiceId = sSteril.Id, AppointmentDatetime = new DateTime(2026, 5, 15, 9, 0, 0), Status = "completed", Notes = "Плановая стерилизация. Прошла успешно." },
                    new Appointment { PetId = pRex.Id, DoctorId = dPetrov.Id, ServiceId = sOsmotr.Id, AppointmentDatetime = new DateTime(2026, 5, 20, 11, 0, 0), Status = "completed", Notes = "Жалобы на вялость. Назначены анализы." },
                    new Appointment { PetId = pRex.Id, DoctorId = dKozlov.Id, ServiceId = sKrov.Id, AppointmentDatetime = new DateTime(2026, 5, 21, 10, 0, 0), Status = "completed", Notes = "Анализ крови — в норме." },
                    new Appointment { PetId = pBelka.Id, DoctorId = dPetrov.Id, ServiceId = sVakts.Id, AppointmentDatetime = new DateTime(2026, 6, 1, 9, 30, 0), Status = "completed", Notes = "Ежегодная вакцинация." },
                    new Appointment { PetId = pKesha.Id, DoctorId = dNovikova.Id, ServiceId = sOsmotr.Id, AppointmentDatetime = new DateTime(2026, 6, 3, 14, 0, 0), Status = "scheduled", Notes = "Плановый осмотр попугая." },
                    new Appointment { PetId = pDruzhok.Id, DoctorId = dPetrov.Id, ServiceId = sParaz.Id, AppointmentDatetime = new DateTime(2026, 6, 5, 10, 0, 0), Status = "scheduled", Notes = "Обработка от паразитов после прогулки в лесу." },
                    new Appointment { PetId = pRizhik.Id, DoctorId = dKozlov.Id, ServiceId = sUZI.Id, AppointmentDatetime = new DateTime(2026, 6, 10, 11, 30, 0), Status = "scheduled", Notes = "УЗИ — контроль после лечения." },
                    new Appointment { PetId = pBarsik.Id, DoctorId = dPetrov.Id, ServiceId = sChip.Id, AppointmentDatetime = new DateTime(2026, 6, 15, 12, 0, 0), Status = "scheduled", Notes = "Плановое чипирование." }
                );
                await db.SaveChangesAsync();
            }
        }
    }
}