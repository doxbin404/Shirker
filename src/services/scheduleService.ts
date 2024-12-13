import { PrismaClient, Schedule, DayOfWeek, WeekType, Teacher, TeacherStatus } from '@prisma/client';

export class ScheduleService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	public async findTeacherByLastName(lastName: string): Promise<Teacher | null> {
		return this.prisma.teacher.findFirst({
			where: { lastName },
		});
	}

	public async addScheduleItem(data: {
		dayOfWeek: DayOfWeek;
		startTime: Date;
		endTime: Date;
		subjectName: string;
		teacherId: string;
		classroom: string;
		weekType: WeekType;
		subgroupId: string;
	}): Promise<Schedule> {
		return this.prisma.schedule.create({
			data,
		});
	}

	public async updateScheduleItem(id: string, data: {
		dayOfWeek?: DayOfWeek;
		startTime?: Date;
		endTime?: Date;
		subjectName?: string;
		teacherId?: string;
		classroom?: string;
		weekType?: WeekType;
		subgroupId?: string;
	}): Promise<Schedule> {
		return this.prisma.schedule.update({
			where: { id },
			data,
		});
	}

	public async deleteScheduleItem(id: string): Promise<Schedule> {
		return this.prisma.schedule.delete({
			where: { id },
		});
	}

	public async getScheduleBySubgroup(subgroupId: string): Promise<Schedule[]> {
		return this.prisma.schedule.findMany({
			where: { subgroupId },
			include: { teacher: true },
		});
	}

	public async createTeacher(data: {
		firstName: string;
		middleName: string;
		lastName: string;
		status: TeacherStatus;
	}): Promise<Teacher> {
		return this.prisma.teacher.create({
			data,
		});
	}
}