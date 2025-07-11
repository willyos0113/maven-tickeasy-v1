package manager.eventdetail.service.impl;

import manager.eventdetail.dao.EventInfoVODao;
import manager.eventdetail.service.EventInfoVOService;
import manager.eventdetail.vo.EventInfoEventVer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EventInfoVOServiceImpl implements EventInfoVOService {
    @Autowired
    private EventInfoVODao eventInfoVODao;

    @Transactional
    @Override
    public EventInfoEventVer getEventById(Integer eventId) {
        return eventInfoVODao.getEventById(eventId);
    }
    
    @Transactional
    @Override
    public List<EventInfoEventVer> getEventsByMemberId(Integer memberId) {
        return eventInfoVODao.getEventsByMemberId(memberId);
    }
} 