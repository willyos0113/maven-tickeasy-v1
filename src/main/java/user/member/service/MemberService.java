package user.member.service;

import java.util.List;

import common.service.CommonService;
import user.member.vo.Member;

public interface MemberService extends CommonService {
	Member register(Member member);

	Member editMember(Member member);

	Member login(Member member);

	Member getById(Integer memberId, Member loginMember);

	Member getByUsername(String username);

	Member getByEmail(String email);

	String getRoleById(Integer memberId);

	boolean removeMemberById(Integer memberId);

	boolean activateMemberByToken(String tokenStr);

	// 以 email 請求密碼重設
	Member requestPasswordResetByEmail(String email);

	// 發送密碼更新認證信
	Member sendPasswordUpdateMail(Member member, String newPassword);

	// 以 token 重設密碼
	Member resetPasswordByToken(String token, String newPassword);

	// 新增：重送驗證信
	Member resendVerificationMail(String email);

	// 新增：發送驗證信
	Member sendVerificationMail(Member member);

	// 密碼變更並刪除token（事務性操作）
	Member updatePasswordAndDeleteToken(Member member, String newPassword, Integer tokenId);
}
