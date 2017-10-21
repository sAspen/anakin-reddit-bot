require('dotenv').config();
const messages = require('../messages');

describe('messages and responses', () => {

    it('should return null if no matches', () => {
        let comment = {
            body: 'This is not a quote from the prequels.',
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).toBeNull();
    });

    it('should return a message if there are matches', () => {
        let comment = {
            body: `not. yet.`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).not.toBeNull();
    });
    
    it('should not care about case sensitivity', () => {
        let comment = {
            body: `NOT. YET.`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).not.toBeNull();
    });

    it('should contain the username if the match contains a $username keyword', () => {
        let comment = {
            body: 'what have i done?',
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).not.toBeNull();
        expect(message).toContain(comment.author.name);
    });

    it('should reply to a user if good bot is mentioned.', () => {
        let comment = {
            parent_id: '123',
            body: `Good bot.`,
            author: {
                name: 'user_123456789'
            }
        };

        let prevCommentIds = [comment.parent_id];

        let message = messages.extractReply(comment, prevCommentIds);

        expect(message).not.toBeNull();
    });
    
    it('should reply to a user if bad bot is mentioned.', () => {
        let comment = {
            parent_id: '123',
            body: `Bad bot.`,
            author: {
                name: 'user_123456789'
            }
        };

        let prevCommentIds = [comment.parent_id];

        let message = messages.extractReply(comment, prevCommentIds);

        expect(message).not.toBeNull();
    });
    
    it('should not reply to itself', () => {
        let comment = {
            body: `not. yet.`,
            author: {
                name: process.env.REDDIT_USER
            }
        };

        let message = messages.extractReply(comment);

        expect(message).toBeNull();
    });

    it('should replace group match keywords with text contained in the comment', () => {
        let comment = {
            body: `the mods will decide your fate.`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).not.toBeNull();
        expect(message).toContain('memes');
    });

    it('should respond to commands', () => {
        let comment = {
            body: `Senate, !ishouldn't`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).not.toBeNull();
    });

    it('should not respond to malformed commands', () => {
        let comment = {
            body: `!shouldnt`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).toBeNull();
    });

    it('should contain the github source url', () => {
        let comment = {
            body: `not. yet.`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).toContain(process.env.GITHUB_SOURCE_URL);
    });
    
    it('should contain the github issues url', () => {
        let comment = {
            body: `not. yet.`,
            author: {
                name: 'user_123456789'
            }
        };

        let message = messages.extractReply(comment);

        expect(message).toContain(process.env.GITHUB_ISSUES_URL);
    });
});
