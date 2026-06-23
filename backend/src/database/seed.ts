import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { ResourceType } from '../entities/ResourceType';
import { Resource } from '../entities/Resource';
import { Booking, BOOKING_STATUS } from '../entities/Booking';

/* eslint-disable no-console */

const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

const seed = async (): Promise<void> => {
  await AppDataSource.initialize();
  console.log('[seed] connected');

  const typeRepo = AppDataSource.getRepository(ResourceType);
  const userRepo = AppDataSource.getRepository(User);
  const resourceRepo = AppDataSource.getRepository(Resource);
  const bookingRepo = AppDataSource.getRepository(Booking);

  const existingTypes = await typeRepo.count();
  if (existingTypes > 0) {
    console.log('[seed] data already present — skipping. Truncate tables to re-seed.');
    await AppDataSource.destroy();
    return;
  }

  // --- Resource types -------------------------------------------------------
  const types = await typeRepo.save([
    typeRepo.create({ name: 'Meeting Room', description: 'Rooms for meetings and discussions' }),
    typeRepo.create({ name: 'Vehicle', description: 'Company cars and vans' }),
    typeRepo.create({ name: 'Equipment', description: 'Shared equipment and devices' }),
    typeRepo.create({ name: 'Workspace', description: 'Hot desks and dedicated workspaces' }),
  ]);
  const [meetingRoom, vehicle, equipment, workspace] = types;
  console.log(`[seed] resource types: ${types.length}`);

  // --- Users ----------------------------------------------------------------
  const users = await userRepo.save([
    userRepo.create({ name: 'Aarav Sharma', email: 'aarav.sharma@example.com', department: 'Engineering' }),
    userRepo.create({ name: 'Diya Patel', email: 'diya.patel@example.com', department: 'Marketing' }),
    userRepo.create({ name: 'Rohan Mehta', email: 'rohan.mehta@example.com', department: 'Sales' }),
    userRepo.create({ name: 'Isha Gupta', email: 'isha.gupta@example.com', department: 'Human Resources' }),
    userRepo.create({ name: 'Kabir Nair', email: 'kabir.nair@example.com', department: 'Operations' }),
  ]);
  console.log(`[seed] users: ${users.length}`);

  // --- Resources ------------------------------------------------------------
  const resources = await resourceRepo.save([
    resourceRepo.create({ name: 'Orion Conference Room', description: 'Large room with video conferencing', location: 'Floor 3, East Wing', capacity: 12, resourceTypeId: meetingRoom.id }),
    resourceRepo.create({ name: 'Nebula Huddle Room', description: 'Small huddle space', location: 'Floor 2, West Wing', capacity: 4, resourceTypeId: meetingRoom.id }),
    resourceRepo.create({ name: 'Apollo Boardroom', description: 'Executive boardroom', location: 'Floor 5', capacity: 20, resourceTypeId: meetingRoom.id }),
    resourceRepo.create({ name: 'Toyota Innova (GJ01AB1234)', description: '7-seater company car', location: 'Basement Parking P1', capacity: 7, resourceTypeId: vehicle.id }),
    resourceRepo.create({ name: 'Tesla Model 3 (GJ05XY9876)', description: 'Electric sedan', location: 'Basement Parking P2', capacity: 5, resourceTypeId: vehicle.id }),
    resourceRepo.create({ name: 'Epson EX3260 Projector', description: 'Portable projector', location: 'IT Store Room', capacity: null, resourceTypeId: equipment.id }),
    resourceRepo.create({ name: 'Canon 90D DSLR Camera', description: 'DSLR with 18-135mm lens', location: 'IT Store Room', capacity: null, resourceTypeId: equipment.id }),
    resourceRepo.create({ name: 'Hot Desk A1', description: 'Window-side hot desk', location: 'Floor 1, Open Area', capacity: 1, resourceTypeId: workspace.id }),
    resourceRepo.create({ name: 'Standing Desk B2', description: 'Adjustable standing desk', location: 'Floor 1, Open Area', capacity: 1, resourceTypeId: workspace.id }),
  ]);
  console.log(`[seed] resources: ${resources.length}`);

  // --- Bookings (mix of upcoming, past, cancelled) --------------------------
  const bookings = await bookingRepo.save([
    bookingRepo.create({
      title: 'Sprint planning',
      resourceId: resources[0].id,
      userId: users[0].id,
      startTime: hoursFromNow(24),
      endTime: hoursFromNow(26),
      status: BOOKING_STATUS.ACTIVE,
    }),
    bookingRepo.create({
      title: 'Client demo',
      resourceId: resources[2].id,
      userId: users[2].id,
      startTime: hoursFromNow(48),
      endTime: hoursFromNow(49),
      status: BOOKING_STATUS.ACTIVE,
    }),
    bookingRepo.create({
      title: 'Airport pickup',
      resourceId: resources[3].id,
      userId: users[4].id,
      startTime: hoursFromNow(-48),
      endTime: hoursFromNow(-45),
      status: BOOKING_STATUS.ACTIVE,
    }),
    bookingRepo.create({
      title: 'Cancelled marketing shoot',
      resourceId: resources[6].id,
      userId: users[1].id,
      startTime: hoursFromNow(72),
      endTime: hoursFromNow(75),
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: new Date(),
    }),
  ]);
  console.log(`[seed] bookings: ${bookings.length}`);

  await AppDataSource.destroy();
  console.log('[seed] done');
};

seed().catch((error) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
