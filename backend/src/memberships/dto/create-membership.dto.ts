import { IsUUID } from 'class-validator';

export class CreateMembershipDto{
    @IsUUID()
    planId: string;
}