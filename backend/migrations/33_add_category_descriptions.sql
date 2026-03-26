-- Migration 33: Add description column for categories and backfill curated descriptions
-- Safe to run multiple times:
-- 1. description column is added only if missing
-- 2. descriptions are backfilled only when NULL/empty

SET @db_name = DATABASE();

SET @add_description_column = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'theloai_new'
        AND COLUMN_NAME = 'description'
    ),
    'SELECT ''skip add theloai_new.description''',
    'ALTER TABLE theloai_new ADD COLUMN description TEXT NULL AFTER ten_theloai'
  )
);
PREPARE stmt FROM @add_description_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `theloai_new`
SET `description` = CASE `ten_theloai`
  WHEN 'Tiên Hiệp' THEN 'Tu tiên, luyện khí, trường sinh bất lão với bối cảnh thần tiên, yêu ma và thế giới phương Đông.'
  WHEN 'Kiếm Hiệp' THEN 'Giang hồ, võ lâm, nghĩa hiệp, tập trung vào võ công, ân oán và đạo nghĩa.'
  WHEN 'Huyền Huyễn' THEN 'Thế giới giả tưởng đậm màu sắc phương Đông, có tu luyện, huyết mạch, bí cảnh và yêu thú.'
  WHEN 'Kỳ Huyễn' THEN 'Thế giới giả tưởng rộng hơn, thiên về phép thuật, chủng tộc và hệ thống sức mạnh linh hoạt.'
  WHEN 'Võ Thần' THEN 'Nhánh truyện thiên về võ đạo, luyện thể và chiến lực cường hóa bản thân đến cảnh giới tối thượng.'
  WHEN 'Ngôn Tình' THEN 'Truyện tình cảm nam nữ, tập trung vào cảm xúc, quan hệ và phát triển tình yêu.'
  WHEN 'Cung Đấu' THEN 'Đấu đá, tranh quyền đoạt vị và mưu lược chốn cung đình hoặc hậu cung.'
  WHEN 'Gia Đấu' THEN 'Mâu thuẫn, đấu trí và tranh đoạt quyền lực trong gia tộc, hào môn hoặc dòng họ lớn.'
  WHEN 'Điền Văn' THEN 'Nhịp truyện nhẹ nhàng, xoay quanh sinh hoạt đời thường, làm ăn, vun vén gia đình và cuộc sống.'
  WHEN 'Ngược' THEN 'Nhân vật chịu nhiều dằn vặt, mất mát hoặc tổn thương về thể xác và tinh thần.'
  WHEN 'Sủng' THEN 'Không khí ngọt ngào, nhân vật được yêu chiều và bảo vệ, ít ngược đãi.'
  WHEN 'Nữ Cường' THEN 'Nhân vật nữ chính mạnh mẽ, độc lập, có năng lực và chủ động trong lựa chọn của mình.'
  WHEN 'Nữ Phụ' THEN 'Main là hoặc xuyên thành nữ phụ, tìm cách thay đổi số phận vốn bị định sẵn trong câu chuyện.'
  WHEN 'Đô Thị' THEN 'Bối cảnh thành phố hiện đại, xoay quanh đời sống, công việc, quan hệ và quyền lực chốn đô thị.'
  WHEN 'Hiện Đại' THEN 'Bối cảnh thời hiện đại nói chung, có thể là học đường, công sở hoặc đời sống đương đại.'
  WHEN 'Cổ Đại' THEN 'Bối cảnh thời xưa với vua chúa, quan lại, lễ giáo, chiến loạn và trật tự xã hội cổ đại.'
  WHEN 'Mạt Thế' THEN 'Bối cảnh hậu tận thế với zombie, thiên tai hoặc xã hội sụp đổ, con người buộc phải sinh tồn.'
  WHEN 'Tận Thế' THEN 'Bối cảnh hậu tận thế với tai họa diện rộng, xã hội đổ vỡ và cuộc chiến sinh tồn khốc liệt.'
  WHEN 'Dã Sử' THEN 'Lấy cảm hứng từ lịch sử nhưng linh hoạt hư cấu thêm nhân vật, sự kiện và thế lực để kể chuyện.'
  WHEN 'Dị Giới' THEN 'Nhân vật đặt chân đến một thế giới hoàn toàn khác với quy tắc, chủng tộc và sức mạnh riêng.'
  WHEN 'Đông Phương' THEN 'Thế giới, mỹ học và hệ thống văn hóa mang màu sắc Á Đông.'
  WHEN 'Tây Phương' THEN 'Bối cảnh và thẩm mỹ chịu ảnh hưởng văn hóa châu Âu, thường có lâu đài, quý tộc và ma pháp.'
  WHEN 'Võng Du' THEN 'Cốt truyện xoay quanh game online, thế giới ảo, bang hội, cày cấp và tương tác trong trò chơi.'
  WHEN 'Khoa Huyễn' THEN 'Khoa học viễn tưởng với công nghệ cao, không gian, robot, du hành hoặc nền văn minh tương lai.'
  WHEN 'Xuyên Không' THEN 'Nhân vật từ thời gian hoặc thế giới này xuyên sang thời gian hay thế giới khác.'
  WHEN 'Xuyên Nhanh' THEN 'Nhân vật liên tục xuyên qua nhiều thế giới hoặc nhiệm vụ khác nhau trong cùng một mạch truyện.'
  WHEN 'Trọng Sinh' THEN 'Nhân vật chết đi rồi sống lại ở quá khứ hoặc thân phận khác để làm lại cuộc đời.'
  WHEN 'Hệ Thống' THEN 'Nhân vật có hệ thống, bảng trạng thái hoặc trợ thủ vô hình hỗ trợ phát triển như trong game.'
  WHEN 'Dị Năng' THEN 'Nhân vật sở hữu siêu năng lực hoặc năng lực đặc biệt trong bối cảnh đời thường hoặc hiện đại.'
  WHEN 'Vô Địch Lưu' THEN 'Nhân vật chính cực mạnh từ sớm hoặc gần như không có đối thủ đáng kể.'
  WHEN 'Đồng Nhân' THEN 'Truyện phát triển dựa trên nhân vật, cốt truyện hoặc thế giới có sẵn từ tác phẩm khác.'
  WHEN 'Trinh Thám' THEN 'Truyện phá án, suy luận, lần theo manh mối và giải mã sự thật.'
  WHEN 'Linh Dị' THEN 'Không khí ma quái, tâm linh, âm khí hoặc hiện tượng siêu nhiên gây rùng rợn.'
  WHEN 'Huyền Nghi' THEN 'Bí ẩn, khó đoán, nhiều lớp thông tin và cảm giác hack não về thực hư sự việc.'
  WHEN 'Quan Trường' THEN 'Tập trung vào chính trị, quan lộ, đấu trí và vận hành quyền lực nơi công quyền.'
  WHEN 'Quân Sự' THEN 'Chiến tranh, binh pháp, quân đội, chiến thuật và xung đột vũ trang là trọng tâm câu chuyện.'
  WHEN 'Lịch Sử' THEN 'Lấy cảm hứng hoặc bám theo bối cảnh, sự kiện và nhân vật của các giai đoạn lịch sử.'
  WHEN 'Sắc' THEN 'Truyện có nhiều yếu tố người lớn, cảnh nhạy cảm hoặc nội dung 18+.'
  WHEN 'Sảng Văn' THEN 'Tiết tấu dồn dập, cảm giác đọc đã, main liên tục bứt phá và khiến người đọc hả hê.'
  WHEN 'Vô Hạn Lưu' THEN 'Nhân vật liên tục bước vào nhiều phó bản, không gian hoặc thế giới nhiệm vụ để sinh tồn và vượt ải.'
  WHEN 'Light Novel' THEN 'Phong cách tiểu thuyết nhẹ theo chất Nhật Bản, thường dễ đọc, tiết tấu nhanh và giàu tính giải trí.'
  WHEN 'Đoản Văn' THEN 'Truyện cực ngắn, triển khai nhanh, cô đọng và tập trung vào một ý hoặc cảm xúc chính.'
  WHEN 'Khác' THEN 'Nhóm tổng hợp cho các truyện khó xếp vào một thể loại cụ thể hoặc mang màu sắc lai ghép.'
  WHEN 'Truyện Việt' THEN 'Truyện sáng tác, biên soạn hoặc chuyển thể gắn với tác giả, bối cảnh hoặc văn phong Việt.'
  ELSE `description`
END
WHERE `ten_theloai` IN (
  'Tiên Hiệp',
  'Kiếm Hiệp',
  'Huyền Huyễn',
  'Kỳ Huyễn',
  'Võ Thần',
  'Ngôn Tình',
  'Cung Đấu',
  'Gia Đấu',
  'Điền Văn',
  'Ngược',
  'Sủng',
  'Nữ Cường',
  'Nữ Phụ',
  'Đô Thị',
  'Hiện Đại',
  'Cổ Đại',
  'Mạt Thế',
  'Tận Thế',
  'Dã Sử',
  'Dị Giới',
  'Đông Phương',
  'Tây Phương',
  'Võng Du',
  'Khoa Huyễn',
  'Xuyên Không',
  'Xuyên Nhanh',
  'Trọng Sinh',
  'Hệ Thống',
  'Dị Năng',
  'Vô Địch Lưu',
  'Đồng Nhân',
  'Trinh Thám',
  'Linh Dị',
  'Huyền Nghi',
  'Quan Trường',
  'Quân Sự',
  'Lịch Sử',
  'Sắc',
  'Sảng Văn',
  'Vô Hạn Lưu',
  'Light Novel',
  'Đoản Văn',
  'Khác',
  'Truyện Việt'
)
  AND (`description` IS NULL OR `description` = '');
