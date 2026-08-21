package the.aditya.live_chat_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import the.aditya.live_chat_backend.entities.Message;
import the.aditya.live_chat_backend.entities.Room;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    Page<Message> findByRoom(Room room, Pageable pageable);
}
