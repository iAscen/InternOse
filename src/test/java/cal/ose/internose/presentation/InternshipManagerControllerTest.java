package cal.ose.internose.presentation;

import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.security.Paths;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.InternshipManagerService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(InternshipManagerController.class)
@AutoConfigureMockMvc(addFilters = false)
class InternshipManagerControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockitoBean
    private InternshipManagerService internshipManagerService;
    @MockitoBean
    private InternshipOfferDAO internshipOfferDAO;

    @Test
    void findInternshipsBy() throws Exception {
        when(internshipManagerService.findInternshipsBy(
            "Informatique", null, null, null
        )).thenReturn(
                List.of(InternshipOfferDTO.builder().domain("Informatique").build())
        );

        MvcResult mvcResult = mockMvc.perform(
                get(Paths.SEARCH_INTERNSHIPS_PATH)
                    .param("domain", "Informatique")
                    .contentType(MediaType.APPLICATION_JSON)
        ).andReturn();

        List<InternshipOfferDTO> responseList = objectMapper.readValue(
                mvcResult.getResponse().getContentAsString(),
                new TypeReference<List<InternshipOfferDTO>>() {}
        );

        assertThat(mvcResult.getResponse().getStatus())
                .isEqualTo(HttpStatus.OK.value());

        assertThat(responseList.getFirst().getDomain()).isEqualTo("Informatique");
    }
}