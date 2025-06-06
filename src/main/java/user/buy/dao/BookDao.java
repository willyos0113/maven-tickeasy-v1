package user.buy.dao;

import java.util.List;
import user.buy.vo.TicketType;

public interface BookDao {
	/**
	 * 選定某活動，查詢所有票種
	 * 
	 * @param 活動 id
	 * @return 符合條件的數筆票種資料
	 */
	List<TicketType> selectById(Integer eventId);
}
