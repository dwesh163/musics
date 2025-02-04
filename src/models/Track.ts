import mongoose, { Document } from 'mongoose';

export interface ITrack extends Document {
	_id: string;
	id: string;
	path: string;
	name: string;
	artistsId: mongoose.Types.ObjectId[];
	albumId: mongoose.Types.ObjectId;
	images: {
		url: string;
		width: number;
		height: number;
	}[];
	duration: number;
}

const trackSchema = new mongoose.Schema<ITrack>({
	id: { type: String, required: true, unique: true },
	path: { type: String, required: true },
	name: { type: String, required: true },
	artistsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true }],
	albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
	images: [
		{
			url: { type: String, required: true },
			width: { type: Number, required: true },
			height: { type: Number, required: true },
		},
	],
	duration: { type: Number, required: true },
});

export const TrackModel = mongoose.models.Track || mongoose.model<ITrack>('Track', trackSchema);
