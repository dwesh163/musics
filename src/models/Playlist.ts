import mongoose, { Document, ObjectId } from 'mongoose';

export interface IPlaylist extends Document {
	_id: string;
	id: string;
	name: string;
	userId: ObjectId;
	tracks: ObjectId[];
	createAt: Date;
}

const playlistSchema = new mongoose.Schema<IPlaylist>({
	id: { type: String, required: true },
	name: { type: String, required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
	createAt: { type: Date, required: true, default: Date.now },
});

export const PlaylistModel = mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', playlistSchema);
