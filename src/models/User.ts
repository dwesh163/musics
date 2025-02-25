import mongoose, { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
	_id: string;
	id: string;
	name: string;
	username?: string;
	image?: string;
	email: string;
	verified?: boolean;
	password?: string;
	accreditation: String;
	favouritePlaylist: ObjectId;
}

const userSchema = new mongoose.Schema<IUser>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	username: { type: String, required: false },
	image: { type: String, required: false },
	email: { type: String, required: true },
	password: { type: String, required: false },
	verified: { type: Boolean, required: false, default: false },
	accreditation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accreditation' },
	favouritePlaylist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
