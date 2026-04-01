import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Session, SessionDocument } from './schemas/session.schema';
import { AiService } from '../ai/ai.service';
import { ModelsService } from '../models/models.service';
import { SendMessageDto, CreateSessionDto } from './dto/send-message.dto';

const GUEST_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private aiService: AiService,
    private modelsService: ModelsService,
  ) {}

  async createSession(dto: CreateSessionDto, userId?: string) {
    const now = new Date();
    const session = await this.sessionModel.create({
      userId: userId || null,
      guestId: dto.isGuest ? uuidv4() : null,
      modelId: dto.modelId,
      messages: [],
      expiresAt: dto.isGuest ? new Date(now.getTime() + GUEST_TTL_MS) : null,
    });
    return {
      sessionId: session._id.toString(),
      guestId: session.guestId,
      expiresAt: session.expiresAt,
    };
  }

  async sendMessage(dto: SendMessageDto, userId?: string) {
    let session: SessionDocument | null = null;

    if (dto.sessionId) {
      session = await this.sessionModel.findById(dto.sessionId);
    }

    if (!session) {
      // Auto-create session
      const now = new Date();
      session = await this.sessionModel.create({
        userId: userId || null,
        guestId: dto.guestId || null,
        modelId: dto.modelId,
        messages: [],
        expiresAt: !userId ? new Date(now.getTime() + GUEST_TTL_MS) : null,
      });
    }

    // Check guest expiry
    if (!userId && session.expiresAt && session.expiresAt < new Date()) {
      throw new ForbiddenException('Guest session expired');
    }

    // Add user message
    const userMsg = { role: 'user', content: dto.content, timestamp: new Date(), attachments: dto.attachments || [] };
    session.messages.push(userMsg as any);

    // Get AI response
    const modelData = await this.modelsService.findOne(dto.modelId);
    const modelName = modelData?.name || dto.modelId;

    const aiHistory = session.messages.map(m => ({ role: m.role, content: m.content }));
    const aiContent = await this.aiService.chat(dto.modelId, modelName, aiHistory);

    const aiMsg = { role: 'assistant', content: aiContent, timestamp: new Date(), attachments: [] };
    session.messages.push(aiMsg as any);
    await session.save();

    return {
      message: aiMsg,
      sessionId: session._id.toString(),
    };
  }

  async getHistory(userId: string) {
    const sessions = await this.sessionModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    return sessions;
  }

  async deleteSession(id: string, userId: string) {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();
    await this.sessionModel.findByIdAndDelete(id);
  }

  async migrateGuestSessions(guestId: string, userId: string) {
    const result = await this.sessionModel.updateMany(
      { guestId, migrated: false },
      { $set: { userId, guestId: null, migrated: true, expiresAt: null } }
    );
    return { migrated: result.modifiedCount };
  }
}
