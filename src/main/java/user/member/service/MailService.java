package user.member.service;

public interface MailService {
	void sendActivationNotification(String toEmail, String userName, String tokenName);

    void sendPasswordResetNotification(String email, String nickName, String tokenName);
}
