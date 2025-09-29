package cal.ose.internose.modele;

public enum Role{
	EMPLOYER("ROLE_EMPLOYER"),
    STUDENT("ROLE_STUDENT"),
    INTERNSHIP_MANAGER("ROLE_INTERNSHIP_MANAGER"),;

	private final String string;

	Role(String string){
		this.string = string;
	}

	@Override
	public String toString(){
		return string;
	}

}
