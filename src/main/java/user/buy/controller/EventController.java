package user.buy.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import user.buy.service.EventInfoService;
import user.buy.vo.EventBuyVO;

/**
 * 活動控制器，處理活動相關RESTful API請求
 * 創建者: archchang
 * 創建日期: 2025-05-07
 */
@RestController
@RequestMapping("/api/events/*")
public class EventController {
	@Autowired
    private EventInfoService eventService;
	
	@GetMapping
    public ResponseEntity<Map<String, Object>> getRecommendedEvents(
            @RequestParam(defaultValue = "10") int limit,
            HttpSession session) {
        
        Integer memberId = getMemberIdFromSession(session);
        List<EventBuyVO> events = eventService.getRecommendedEvents(limit, memberId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("data", events);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{eventId}")
    public ResponseEntity<Map<String, Object>> getEventDetail(
            @PathVariable Integer eventId,
            HttpSession session) {
        
        Integer memberId = getMemberIdFromSession(session);
        EventBuyVO event = eventService.getEventDetail(eventId, memberId);
        
        Map<String, Object> response = new HashMap<>();
        
        if (event != null) {
            response.put("status", 200);
            response.put("data", event);
        } else {
            response.put("status", 404);
            response.put("errorCode", "B0004");
            response.put("errorMessage", "活動不存在");
            response.put("userMessage", "找不到對應的活動");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{eventId}/favorite")
    public ResponseEntity<Map<String, Object>> toggleEventFavorite(
            @PathVariable Integer eventId,
            @RequestParam Integer isFollowed,
            HttpSession session) {
        
        Integer memberId = getMemberIdFromSession(session);
        
        if (memberId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", 401);
            response.put("errorCode", "A0001");
            response.put("errorMessage", "用戶未登入");
            response.put("userMessage", "請先登入");
            return ResponseEntity.status(401).body(response);
        }
        
        boolean success = eventService.toggleEventFavorite(memberId, eventId, isFollowed);
        
        Map<String, Object> response = new HashMap<>();
        
        if (success) {
            response.put("status", 200);
        } else {
            response.put("status", 500);
            response.put("errorCode", "B0006");
            response.put("errorMessage", "設置關注狀態失敗");
            response.put("userMessage", "無法設置關注狀態，請稍後再試");
        }
        
        return ResponseEntity.ok(response);
    }
    
    private Integer getMemberIdFromSession(HttpSession session) {
        Object memberId = session.getAttribute("memberId");
        return memberId instanceof Integer ? (Integer) memberId : null;
    }
	
}