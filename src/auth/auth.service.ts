import { BadRequestException, Injectable, InternalServerErrorException, Request, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginReponse } from './interfaces/login-response';
import { CreateUserDto, LoginDTO, RegisterUserDto, UpdateUserDto } from './dto';

@Injectable()
export class AuthService {


  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtServices:JwtService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });
      await newUser.save();

      const {password:_, ...user} = newUser.toJSON();

      return user;

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exist!`)
      }

      throw new InternalServerErrorException('Something terrible happen!!!')
    }


  }

  async Login(loginDTO:LoginDTO):Promise<LoginReponse>{

    const {email,password} = loginDTO
    const user = await this.userModel.findOne({email})
    if(!user){
      throw new UnauthorizedException('Not valid credentials - email')
    }
    
    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const {password:_, ...rest} = user.toJSON()

    return {
      user: rest,
      token: this.getJwtToken({ id:user.id })
    }

  }

  async Register(registerDto:RegisterUserDto):Promise<LoginReponse>{

    const user = await this.create(registerDto);

    return {
      user,
      token:this.getJwtToken({id:user._id})
    }
  }

  async findAll() : Promise<User[]> {
    return  await this.userModel.find();
  }

  async FindUserById(id:string):Promise<User>{
    const user = await this.userModel.findById(id);
    const {password:_, ...rest} = user.toJSON()
    return rest;
  }

   getJwtToken(payload:JwtPayload){
    const token =  this.jwtServices.sign(payload);
    return token;
  }


    // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, _UpdateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
