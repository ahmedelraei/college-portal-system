import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export class ProcessPaymentDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}\/\d{2}$/, { message: 'Expiry date must be in MM/YY format' })
  expiryDate: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 4)
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;

  @IsNotEmpty()
  @IsString()
  cardholderName: string;

  @IsOptional()
  @IsString()
  failureReason?: string; // For testing purposes
}
