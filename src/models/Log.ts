import mongoose, { Document } from 'mongoose';

export interface ILog extends Document {
	_id: string;
	userId: String;
	date: Date;
	type: 'listen' | 'download';
	trackId: String;
}

const logSchema = new mongoose.Schema<ILog>({
	date: { type: Date, required: true, default: Date.now },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	type: { type: String, required: true, enum: ['listen', 'download'] },
	trackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
});

export const LogModel = mongoose.models.Log || mongoose.model<ILog>('Log', logSchema);
